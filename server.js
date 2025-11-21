require('dotenv').config();
const express = require('express');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cookieSession = require('cookie-session');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const { processGoogleAuth } = require('./lib/auth-helper');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup - Use Supabase on Vercel if configured, otherwise SQLite
let db = null;
let supabase = null;
const useSupabase = process.env.VERCEL === '1' && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

if (useSupabase) {
  try {
    // Initialize Supabase
    console.log('🔧 Initializing Supabase...');
    console.log('🔧 SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
    console.log('🔧 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables not set');
    }
    
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    console.log('✅ Using Supabase database (production)');
    
    // Create db-like interface for compatibility (will be implemented below)
    db = createSupabaseWrapper(supabase);
    
    // Test connection (async, but don't block)
    (async () => {
      try {
        const { data, error } = await supabase.from('students').select('id').limit(1);
        if (error) {
          console.warn('⚠️  Supabase connection test failed:', error.message);
        } else {
          console.log('✅ Supabase connection test successful');
        }
      } catch (testError) {
        console.warn('⚠️  Supabase connection test error:', testError.message);
      }
    })();
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    console.error('Error details:', error.message, error.stack);
    // Fallback to SQLite even on Vercel if Supabase fails
    const dbPath = path.join('/tmp', 'database.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.warn('⚠️  Using SQLite fallback (Supabase init failed)');
      }
    });
    supabase = null; // Ensure it's defined
  }
} else {
  // Use SQLite for local development
  const dbPath = path.join(__dirname, 'database.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('✅ Using SQLite database (local)');
    }
  });
  supabase = null; // Ensure it's defined
}

// Create Supabase wrapper that mimics SQLite interface
function createSupabaseWrapper(supabase) {
  return {
    get: function(query, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      executeSupabaseQuery(query, params, 'get')
        .then(result => {
          // Only log for Supabase (production), not for localhost SQLite
          if (process.env.VERCEL === '1') {
            console.log('✅ db.get success:', { query: query.substring(0, 50), result: result ? 'found' : 'not found' });
          }
          callback(null, result);
        })
        .catch(err => {
          console.error('❌ db.get error:', { query: query.substring(0, 50), error: err.message, stack: err.stack });
          callback(err);
        });
    },
    all: function(query, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      executeSupabaseQuery(query, params, 'all')
        .then(result => callback(null, result || []))
        .catch(callback);
    },
    run: function(query, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      executeSupabaseQuery(query, params, 'run')
        .then(result => {
          const fakeThis = { lastID: result.lastID || result.id, changes: result.changes || 1 };
          // Only log for Supabase (production), not for localhost SQLite
          if (process.env.VERCEL === '1') {
            console.log('✅ db.run success:', { query: query.substring(0, 50), lastID: fakeThis.lastID });
          }
          callback.call(fakeThis, null);
        })
        .catch(err => {
          console.error('❌ db.run error:', { query: query.substring(0, 50), error: err.message, stack: err.stack });
          callback(err);
        });
    },
    serialize: function(callback) {
      // No-op for Supabase, just run the callback
      if (callback) callback();
    },
    prepare: function(query) {
      // Supabase doesn't use prepared statements, but we'll create a mock
      return {
        run: function(params, callback) {
          // Execute the query directly
          const upperQuery = query.trim().toUpperCase();
          if (upperQuery.startsWith('INSERT')) {
            executeInsert(query, params || [])
              .then(result => {
                const fakeThis = { lastID: result.lastID || result.id, changes: result.changes || 1 };
                if (callback) callback.call(fakeThis, null);
              })
              .catch(callback);
          } else {
            executeSupabaseQuery(query, params || [], 'run')
              .then(result => {
                const fakeThis = { lastID: result.lastID, changes: result.changes };
                if (callback) callback.call(fakeThis, null);
              })
              .catch(callback);
          }
        },
        finalize: function() {} // No-op
      };
    },
    close: function() {} // No-op for Supabase
  };
}

// Execute Supabase queries (simplified SQL parser)
async function executeSupabaseQuery(query, params = [], type) {
  const upperQuery = query.trim().toUpperCase();
  
  try {
    if (upperQuery.startsWith('SELECT')) {
      // Check for COUNT queries
      if (query.includes('COUNT(*)')) {
        return await executeCount(query, params);
      }
      // Check for JOIN queries
      if (query.includes('JOIN')) {
        return await executeJoin(query, params, type);
      }
      return await executeSelect(query, params, type);
    } else if (upperQuery.startsWith('INSERT')) {
      return await executeInsert(query, params);
    } else if (upperQuery.startsWith('UPDATE')) {
      return await executeUpdate(query, params);
    } else if (upperQuery.startsWith('DELETE')) {
      return await executeDelete(query, params);
    } else if (upperQuery.startsWith('CREATE TABLE')) {
      // Tables should already exist from SQL schema
      return { lastID: null, changes: 0 };
    }
    throw new Error('Unsupported query type');
  } catch (error) {
    console.error('Supabase query error:', error, 'Query:', query.substring(0, 100));
    throw error;
  }
}

// Execute COUNT queries
async function executeCount(query, params) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // Handle COUNT with JOIN (admin dashboard pendingRequests query)
  if (query.includes('JOIN')) {
    return await executeCountWithJoin(query, params);
  }
  
  // Handle simple COUNT(*) FROM table
  const simpleCountMatch = query.match(/COUNT\(\*\)\s+FROM\s+(\w+)/i);
  if (simpleCountMatch) {
    const table = simpleCountMatch[1];
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return { count: count || 0 };
  }
  
  // Handle COUNT with WHERE
  const countWhereMatch = query.match(/COUNT\(\*\)\s+as\s+count\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?/i);
  if (countWhereMatch) {
    const table = countWhereMatch[1];
    const whereClause = countWhereMatch[2];
    
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    
    if (whereClause) {
      // Handle status = "pending"
      const statusMatch = whereClause.match(/status\s*=\s*["'](\w+)["']/i);
      if (statusMatch) {
        q = q.eq('status', statusMatch[1]);
      }
    }
    
    const { count, error } = await q;
    if (error) throw error;
    return { count: count || 0 };
  }
  
  throw new Error('Unsupported COUNT query format');
}

// Execute COUNT with JOIN
async function executeCountWithJoin(query, params) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // Handle: SELECT COUNT(*) as count FROM access_requests ar JOIN modules m ON ar.module_id = m.id WHERE ar.status = "pending" AND m.id <= 7
  if (query.includes('access_requests') && query.includes('modules')) {
    const { data, error } = await supabase
      .from('access_requests')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .lte('module_id', 7);
    
    if (error) throw error;
    return { count: data?.length || 0 };
  }
  
  // Generic COUNT with JOIN - just count from main table
  const mainTableMatch = query.match(/FROM\s+(\w+)/i);
  if (mainTableMatch) {
    const table = mainTableMatch[1];
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return { count: count || 0 };
  }
  
  throw new Error('Unsupported COUNT JOIN query format');
}

// Execute JOIN queries
async function executeJoin(query, params, type) {
  // Parse main table and joins
  const mainTableMatch = query.match(/FROM\s+(\w+)/i);
  if (!mainTableMatch) throw new Error('No main table in JOIN');
  
  const mainTable = mainTableMatch[1];
  const aliasMatch = query.match(/FROM\s+\w+\s+(\w+)/i);
  const mainAlias = aliasMatch ? aliasMatch[1] : mainTable;
  
  // Parse JOIN clauses
  const joinMatches = query.matchAll(/JOIN\s+(\w+)\s+(\w+)?\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/gi);
  const joins = Array.from(joinMatches);
  
  // Build select with foreign table references
  // For Supabase, we need to use the foreign table relationship
  // This is a simplified version - for complex joins, we may need to do multiple queries
  
  // For the admin dashboard query, we'll handle it specially
  if (query.includes('access_requests') && query.includes('students') && query.includes('modules') && query.includes('JOIN students s ON')) {
    return await executeAdminDashboardJoin(query, params, type);
  }
  
  // For the student dashboard query with LEFT JOINs
  if (query.includes('FROM modules m') && query.includes('LEFT JOIN access_requests') && query.includes('LEFT JOIN progress')) {
    return await executeStudentDashboardJoin(query, params, type);
  }
  
  // For admin messages query with JOIN
  if (query.includes('FROM messages m') && query.includes('JOIN students s')) {
    return await executeAdminMessagesJoin(query, params, type);
  }
  
  // For admin students query with JOINs and GROUP BY
  if (query.includes('FROM students s') && query.includes('LEFT JOIN access_requests') && query.includes('GROUP BY')) {
    return await executeAdminStudentsJoin(query, params, type);
  }
  
  // Generic join handling (simplified)
  // For now, just select from main table and handle joins manually if needed
  const { data, error } = await supabase.from(mainTable).select('*');
  if (error) throw error;
  
  return type === 'get' ? (data?.[0] || null) : (data || []);
}

// Special handler for admin dashboard join query
async function executeAdminDashboardJoin(query, params, type) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // This handles: SELECT ar.*, s.full_name, s.email, m.module_name FROM access_requests ar JOIN students s ON ar.student_id = s.id JOIN modules m ON ar.module_id = m.id WHERE ar.status = 'pending' AND m.id <= 7 ORDER BY ar.created_at DESC LIMIT 10
  
  // Use Supabase's foreign key relationships
  // The foreign key names should match what's in the schema
  let q = supabase
    .from('access_requests')
    .select(`
      *,
      students:student_id(full_name, email),
      modules:module_id(module_name, id)
    `)
    .eq('status', 'pending')
    .lte('module_id', 7);
  
  const { data, error } = await q.order('created_at', { ascending: false }).limit(10);
  if (error) {
    // If foreign key syntax fails, try alternative approach
    console.warn('Foreign key join failed, trying alternative:', error.message);
    // Fallback: fetch separately and join in code
    const { data: requests, error: reqError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('status', 'pending')
      .lte('module_id', 7)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (reqError) throw reqError;
    
    // Fetch related data
    const studentIds = [...new Set(requests.map(r => r.student_id))];
    const moduleIds = [...new Set(requests.map(r => r.module_id))];
    
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, email')
      .in('id', studentIds);
    
    const { data: modules } = await supabase
      .from('modules')
      .select('id, module_name')
      .in('id', moduleIds);
    
    // Join in code
    const joined = requests.map(req => ({
      ...req,
      full_name: students?.find(s => s.id === req.student_id)?.full_name,
      email: students?.find(s => s.id === req.student_id)?.email,
      module_name: modules?.find(m => m.id === req.module_id)?.module_name
    }));
    
    return type === 'get' ? (joined[0] || null) : joined;
  }
  
  // Format response (handle nested structure)
  const formatted = (data || []).map(item => ({
    ...item,
    full_name: item.students?.full_name || (Array.isArray(item.students) ? item.students[0]?.full_name : null),
    email: item.students?.email || (Array.isArray(item.students) ? item.students[0]?.email : null),
    module_name: item.modules?.module_name || (Array.isArray(item.modules) ? item.modules[0]?.module_name : null)
  }));
  
  return type === 'get' ? (formatted[0] || null) : formatted;
}

// Special handler for student dashboard join query
async function executeStudentDashboardJoin(query, params, type) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // This handles: SELECT m.*, CASE... END as access_status, ar.admin_comment, p.progress_status, p.percentage_completed, p.last_updated as progress_updated FROM modules m LEFT JOIN access_requests ar ON m.id = ar.module_id AND ar.student_id = ? LEFT JOIN progress p ON m.id = p.module_id AND p.student_id = ? WHERE m.id <= 7 ORDER BY m.id
  
  const studentId = params[0] || params[1]; // Should be the same value
  
  // Fetch modules
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .lte('id', 7)
    .order('id', { ascending: true });
  
  if (modulesError) throw modulesError;
  
  // Fetch access requests for this student
  const { data: accessRequests, error: arError } = await supabase
    .from('access_requests')
    .select('*')
    .eq('student_id', studentId)
    .in('module_id', modules.map(m => m.id));
  
  if (arError) throw arError;
  
  // Fetch progress for this student
  const { data: progress, error: progressError } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
    .in('module_id', modules.map(m => m.id));
  
  if (progressError) throw progressError;
  
  // Join the data
  const result = modules.map(module => {
    const ar = accessRequests?.find(a => a.module_id === module.id);
    const prog = progress?.find(p => p.module_id === module.id);
    
    // Calculate access_status
    // Module 1 is free but still requires authorization via unlockModule1 (access request)
    let access_status = 'not_requested';
    if (ar) {
      access_status = ar.status;
    } else if (module.access_type === 'open' && module.id !== 1) {
      // Other open modules (not Module 1) are automatically approved
      access_status = 'approved';
    }
    
    return {
      ...module,
      access_status,
      admin_comment: ar?.admin_comment || null,
      progress_status: prog?.progress_status || null,
      percentage_completed: prog?.percentage_completed || 0,
      progress_updated: prog?.last_updated || null
    };
  });
  
  return type === 'get' ? (result[0] || null) : result;
}

// Special handler for admin messages join query
async function executeAdminMessagesJoin(query, params, type) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // SELECT m.*, s.full_name, s.email FROM messages m JOIN students s ON m.student_id = s.id ORDER BY m.created_at DESC
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      students:student_id(full_name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    // Fallback: fetch separately
    const { data: msgs, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (msgError) throw msgError;
    
    const studentIds = [...new Set(msgs.map(m => m.student_id))];
    const { data: students } = await supabase
      .from('students')
      .select('id, full_name, email')
      .in('id', studentIds);
    
    const joined = msgs.map(msg => ({
      ...msg,
      full_name: students?.find(s => s.id === msg.student_id)?.full_name,
      email: students?.find(s => s.id === msg.student_id)?.email
    }));
    
    return type === 'get' ? (joined[0] || null) : joined;
  }
  
  const formatted = (messages || []).map(msg => ({
    ...msg,
    full_name: msg.students?.full_name || (Array.isArray(msg.students) ? msg.students[0]?.full_name : null),
    email: msg.students?.email || (Array.isArray(msg.students) ? msg.students[0]?.email : null)
  }));
  
  return type === 'get' ? (formatted[0] || null) : formatted;
}

// Special handler for admin students join query with GROUP BY
async function executeAdminStudentsJoin(query, params, type) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  // SELECT s.*, COUNT(...) as approved_modules, COUNT(...) as pending_requests FROM students s LEFT JOIN access_requests ar ON s.id = ar.student_id LEFT JOIN modules m ON ar.module_id = m.id WHERE s.is_admin = 0 GROUP BY s.id ORDER BY s.created_at DESC
  
  // Fetch all students (non-admin)
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .eq('is_admin', false)
    .order('created_at', { ascending: false });
  
  if (studentsError) throw studentsError;
  
  // Fetch all access requests for these students
  const studentIds = students.map(s => s.id);
  const { data: accessRequests, error: arError } = await supabase
    .from('access_requests')
    .select('*')
    .in('student_id', studentIds);
  
  if (arError) throw arError;
  
  // Calculate counts for each student
  const result = students.map(student => {
    const studentRequests = accessRequests?.filter(ar => ar.student_id === student.id) || [];
    const approved = studentRequests.filter(ar => ar.status === 'approved' && ar.module_id <= 7).length;
    const pending = studentRequests.filter(ar => ar.status === 'pending' && ar.module_id <= 7).length;
    
    return {
      ...student,
      approved_modules: approved,
      pending_requests: pending
    };
  });
  
  return type === 'get' ? (result[0] || null) : result;
}

async function executeSelect(query, params, type) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const tableMatch = query.match(/FROM\s+(\w+)/i);
  if (!tableMatch) throw new Error('No table in SELECT');
  const table = tableMatch[1];
  
  let q = supabase.from(table).select('*');
  
  // Handle WHERE clause
  const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i);
  if (whereMatch) {
    const whereClause = whereMatch[1];
    // Handle "column = ?" or "column = ? OR column = ?"
    if (whereClause.includes('OR')) {
      const parts = whereClause.split(/\s+OR\s+/i);
      if (parts.length === 2 && params.length === 2) {
        // Handle: WHERE gmail_uid = ? OR email = ?
        // For Supabase, we need to query both conditions and combine
        const match1 = parts[0].match(/(\w+)\s*=\s*\?/);
        const match2 = parts[1].match(/(\w+)\s*=\s*\?/);
        if (match1 && match2) {
          // Query both conditions separately and combine results
          const [q1, q2] = await Promise.all([
            supabase.from(table).select('*').eq(match1[1], params[0]),
            supabase.from(table).select('*').eq(match2[1], params[1])
          ]);
          
          if (q1.error) throw q1.error;
          if (q2.error) throw q2.error;
          
          // Combine and deduplicate results
          const combined = [...(q1.data || []), ...(q2.data || [])];
          const unique = combined.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );
          
          // Normalize data
          const normalizeData = (rows) => {
            if (!rows) return rows;
            const normalized = Array.isArray(rows) ? rows : [rows];
            return normalized.map(row => {
              if (!row) return row;
              const normalizedRow = { ...row };
              if (typeof normalizedRow.is_admin === 'boolean') {
                normalizedRow.is_admin = normalizedRow.is_admin ? 1 : 0;
              }
              return normalizedRow;
            });
          };
          
          const normalized = normalizeData(unique);
          return type === 'get' ? (normalized[0] || null) : (normalized || []);
        }
      }
      // Fallback: try Supabase OR syntax
      let paramIndex = 0;
      const orConditions = [];
      parts.forEach((part) => {
        const match = part.match(/(\w+)\s*=\s*\?/);
        if (match && paramIndex < params.length) {
          orConditions.push(`${match[1]}.eq.${params[paramIndex]}`);
          paramIndex++;
        }
      });
      if (orConditions.length > 0) {
        q = q.or(orConditions.join(','));
      }
    } else {
      const match = whereClause.match(/(\w+)\s*=\s*\?/);
      if (match && params.length > 0) {
        q = q.eq(match[1], params[0]);
      }
    }
  }
  
  // ORDER BY
  const orderMatch = query.match(/ORDER BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
  if (orderMatch) {
    q = q.order(orderMatch[1], { ascending: !orderMatch[2] || orderMatch[2].toUpperCase() === 'ASC' });
  }
  
  // LIMIT
  const limitMatch = query.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    q = q.limit(parseInt(limitMatch[1]));
  }
  
  const { data, error } = await q;
  if (error) throw error;
  
  // Normalize data for compatibility (convert PostgreSQL booleans to 0/1)
  const normalizeData = (rows) => {
    if (!rows) return rows;
    const normalized = Array.isArray(rows) ? rows : [rows];
    return normalized.map(row => {
      if (!row) return row;
      const normalizedRow = { ...row };
      // Convert boolean is_admin to 0/1 for compatibility
      if (typeof normalizedRow.is_admin === 'boolean') {
        normalizedRow.is_admin = normalizedRow.is_admin ? 1 : 0;
      }
      return normalizedRow;
    });
  };
  
  const normalized = normalizeData(data);
  return type === 'get' ? (normalized[0] || null) : (normalized || []);
}

async function executeInsert(query, params) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const tableMatch = query.match(/INTO\s+(\w+)/i);
  if (!tableMatch) throw new Error('No table in INSERT');
  const table = tableMatch[1];
  
  const columnsMatch = query.match(/\(([^)]+)\)/);
  if (!columnsMatch) throw new Error('No columns in INSERT');
  const columns = columnsMatch[1].split(',').map(c => c.trim());
  
  // Parse VALUES clause to match columns with values
  const valuesMatch = query.match(/VALUES\s*\(([^)]+)\)/i);
  if (!valuesMatch) throw new Error('No VALUES in INSERT');
  const values = valuesMatch[1].split(',').map(v => v.trim());
  
  const data = {};
  let paramIndex = 0;
  columns.forEach((col, i) => {
    const value = values[i];
    
    // Handle CURRENT_TIMESTAMP literal
    if (value === 'CURRENT_TIMESTAMP' || value.includes('CURRENT_TIMESTAMP')) {
      if (col.includes('created_at') || col.includes('updated_at') || col.includes('last_updated')) {
        data[col] = new Date().toISOString();
      }
    }
    // Handle string literals like 'pending', 'student', etc.
    else if (value.match(/^["']/)) {
      // It's a literal string, extract the value
      const literalValue = value.replace(/^["']|["']$/g, '');
      data[col] = literalValue;
    }
    // Handle numeric literals like 0, 1
    else if (value.match(/^\d+$/)) {
      const numValue = parseInt(value);
      // Convert boolean for is_admin
      if (col === 'is_admin') {
        data[col] = numValue === 1;
      } else {
        data[col] = numValue;
      }
    }
    // Handle ? placeholder
    else if (value === '?') {
      if (params[paramIndex] !== undefined) {
        // Convert boolean values for PostgreSQL compatibility
        if (col === 'is_admin' && (params[paramIndex] === 0 || params[paramIndex] === 1)) {
          data[col] = params[paramIndex] === 1;
        } else {
          data[col] = params[paramIndex];
        }
        paramIndex++;
      }
    }
  });
  
  const isUpsert = query.toUpperCase().includes('OR REPLACE') || query.toUpperCase().includes('OR IGNORE');
  
  let result;
  if (isUpsert) {
    const { data: inserted, error } = await supabase.from(table).upsert(data).select();
    if (error) throw error;
    result = { lastID: inserted?.[0]?.id, changes: inserted?.length || 0, id: inserted?.[0]?.id };
  } else {
    const { data: inserted, error } = await supabase.from(table).insert(data).select();
    if (error) throw error;
    result = { lastID: inserted?.[0]?.id, changes: inserted?.length || 0, id: inserted?.[0]?.id };
  }
  return result;
}

async function executeUpdate(query, params) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const tableMatch = query.match(/UPDATE\s+(\w+)/i);
  if (!tableMatch) throw new Error('No table in UPDATE');
  const table = tableMatch[1];
  
  const setMatches = query.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
  if (!setMatches) throw new Error('No SET in UPDATE');
  
  const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i);
  if (!whereMatch) throw new Error('UPDATE needs WHERE');
  
  // Parse SET clause - handle multiple assignments
  const updates = {};
  let paramIndex = 0;
  const assignments = setMatches[1].split(',').map(a => a.trim());
  assignments.forEach(assignment => {
    // Handle CURRENT_TIMESTAMP
    if (assignment.includes('CURRENT_TIMESTAMP')) {
      const colMatch = assignment.match(/(\w+)\s*=\s*CURRENT_TIMESTAMP/);
      if (colMatch) {
        updates[colMatch[1]] = new Date().toISOString();
      }
    } else {
      const match = assignment.match(/(\w+)\s*=\s*\?/);
      if (match) {
        const col = match[1];
        const val = params[paramIndex++];
        // Convert boolean values for PostgreSQL compatibility
        if (col === 'is_admin' && (val === 0 || val === 1)) {
          updates[col] = val === 1;
        } else {
          updates[col] = val;
        }
      }
    }
  });
  
  // Parse WHERE
  const whereClause = whereMatch[1];
  const whereMatch2 = whereClause.match(/(\w+)\s*=\s*\?/);
  if (!whereMatch2) throw new Error('WHERE must be "column = ?"');
  
  let q = supabase.from(table).update(updates);
  q = q.eq(whereMatch2[1], params[paramIndex]);
  
  const { data, error } = await q.select();
  if (error) throw error;
  return { lastID: null, changes: data?.length || 0 };
}

async function executeDelete(query, params) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const tableMatch = query.match(/FROM\s+(\w+)/i);
  if (!tableMatch) throw new Error('No table in DELETE');
  const table = tableMatch[1];
  
  const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|$)/i);
  if (!whereMatch) throw new Error('DELETE needs WHERE');
  
  const whereClause = whereMatch[1];
  const match = whereClause.match(/(\w+)\s*=\s*\?/);
  if (!match) throw new Error('WHERE must be "column = ?"');
  
  const { data, error } = await supabase.from(table).delete().eq(match[1], params[0]).select();
  if (error) throw error;
  return { lastID: null, changes: data?.length || 0 };
}

// Initialize database tables
if (useSupabase && supabase) {
  // For Supabase, tables should be created via SQL schema
  // But ensure default modules exist
  (async () => {
    try {
      const { data: existingModules } = await supabase.from('modules').select('id').limit(1);
      if (!existingModules || existingModules.length === 0) {
        // Insert default modules
        const defaultModules = [
          { module_name: 'Foundation & Financial Freedom Roadmap', description: 'Build your foundation and create a clear roadmap to financial freedom through property management.', access_type: 'open' },
          { module_name: 'Market Understanding & Property Strategy', description: 'Understand the property market and develop effective strategies.', access_type: 'requires_approval' },
          { module_name: 'Business Setup & Compliance Foundations', description: 'Set up your business legally and ensure compliance.', access_type: 'requires_approval' },
          { module_name: 'Client Acquisition & Lettings Operations', description: 'Learn how to acquire clients and manage lettings operations.', access_type: 'requires_approval' },
          { module_name: 'Property Management & Relationship Building', description: 'Master property management and build strong client relationships.', access_type: 'requires_approval' },
          { module_name: 'End of Tenancy, Renewals & Compliance Updates', description: 'Handle tenancy endings, renewals, and stay compliant.', access_type: 'requires_approval' },
          { module_name: 'Scaling, Marketing & Portfolio Growth', description: 'Scale your business through marketing and portfolio expansion.', access_type: 'requires_approval' }
        ];
        await supabase.from('modules').insert(defaultModules);
        console.log('✅ Default modules inserted into Supabase');
      }
    } catch (error) {
      console.error('Error initializing Supabase modules:', error);
    }
  })();
} else {
  // Initialize SQLite tables
  db.serialize(() => {
      // Students table
      db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone_number TEXT,
          gmail_uid TEXT UNIQUE,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
          is_admin BOOLEAN DEFAULT 0,
          role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Modules table
      db.run(`
        CREATE TABLE IF NOT EXISTS modules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          module_name TEXT NOT NULL,
          description TEXT,
          access_type TEXT DEFAULT 'requires_approval' CHECK (access_type IN ('open', 'requires_approval')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Access Requests table
      db.run(`
        CREATE TABLE IF NOT EXISTS access_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          module_id INTEGER NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
          admin_comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
          UNIQUE(student_id, module_id)
        )
      `);

      // Progress table
      db.run(`
        CREATE TABLE IF NOT EXISTS progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          module_id INTEGER NOT NULL,
          progress_status TEXT DEFAULT 'not_started' CHECK (progress_status IN ('not_started', 'in_progress', 'completed')),
          percentage_completed INTEGER DEFAULT 0 CHECK (percentage_completed >= 0 AND percentage_completed <= 100),
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
          UNIQUE(student_id, module_id)
        )
      `);

      // Messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          message_content TEXT NOT NULL,
          status TEXT DEFAULT 'unread' CHECK (status IN ('read', 'unread')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
      `);
  });
}

// Middleware
// app.use(helmet()); // Temporarily disable helmet to fix loading issue

// Disable CSP completely for development
app.use((req, res, next) => {
  // Disable caching to prevent header caching issues
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  next();
});
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests in dev, 100 in production
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Session configuration
// On Vercel serverless, use cookie-session (stores session data in cookie, persists across invocations)
// For local development, use express-session with SQLite store
if (process.env.VERCEL === '1') {
  // Use cookie-session for Vercel - stores session data directly in cookie (works across serverless invocations)
  // Vercel always uses HTTPS, so secure must be true
  app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || '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GOCSPX-qCd-ZEYR2MCosUgIbPnIiW8kHumk'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true, // Always true on Vercel (always HTTPS)
    sameSite: 'lax', // Works for same-site redirects (OAuth callback is same-site)
    httpOnly: true, // Ensure cookie is httpOnly for security
    path: '/', // Ensure cookie is available for all paths
    // Don't set domain - let browser use default (works for all subdomains on Vercel)
    signed: true // Sign cookies for security
  }));
  
  // Add Passport-compatible methods to cookie-session
  // Passport expects express-session methods like regenerate, save, touch
  app.use((req, res, next) => {
    if (req.session) {
      // Add regenerate method (Passport calls this during login)
      if (typeof req.session.regenerate !== 'function') {
        req.session.regenerate = function(callback) {
          // For cookie-session, we don't need to actually regenerate
          // Just ensure the session is marked as modified so it gets saved
          // Preserve all existing session data
          // cookie-session auto-saves, so we just call the callback
          if (callback) {
            process.nextTick(callback);
          }
        };
      }
      
      // Add save method (Passport might call this)
      if (typeof req.session.save !== 'function') {
        req.session.save = function(callback) {
          // cookie-session auto-saves, so we just call the callback
          if (callback) {
            process.nextTick(callback);
          }
        };
      }
      
      // Add touch method (updates session expiration)
      if (typeof req.session.touch !== 'function') {
        req.session.touch = function() {
          // cookie-session handles expiration via maxAge, so this is a no-op
        };
      }
    }
    next();
  });
} else {
  // Use express-session with SQLite store for local development
  const sessionStore = new SQLiteStore({ db: 'sessions.db', dir: __dirname });
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || '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GOCSPX-qCd-ZEYR2MCosUgIbPnIiW8kHumk',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      httpOnly: true,
      path: '/'
    }
  }));
}

// Passport configuration
app.use(passport.initialize());

// Passport session middleware - must come after session middleware
// This deserializes the user from the session on each request
app.use(passport.session());

// Debug middleware for Vercel - log session state on each request
if (process.env.VERCEL === '1') {
  app.use((req, res, next) => {
    // Only log for auth-related routes to avoid spam
    if (req.path.startsWith('/auth/') || req.path.startsWith('/api/') || req.path === '/') {
      console.log('🔍 Request session state:', {
        path: req.path,
        hasSession: !!req.session,
        hasPassport: !!(req.session && req.session.passport),
        passportUser: req.session?.passport?.user,
        isAuthenticated: req.isAuthenticated(),
        hasUser: !!req.user,
        cookieHeader: req.headers.cookie ? 'present' : 'missing'
      });
    }
    next();
  });
}

// Check if Google OAuth is configured
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  WARNING: Google OAuth credentials not configured!');
  console.warn('⚠️  Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
}

// Shared Google OAuth Strategy
// Uses state parameter to differentiate between admin and student login
// On Vercel, use BASE_URL or construct from Vercel URL
const baseCallbackURL = process.env.VERCEL === '1'
  ? `${process.env.BASE_URL || process.env.VERCEL_URL || 'https://tsol-final-course.vercel.app'}/auth/google/callback`
  : (process.env.NODE_ENV === 'production' 
      ? `${process.env.BASE_URL || 'https://yourdomain.com'}/auth/google/callback`
      : 'http://localhost:3000/auth/google/callback');

passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'dummy',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
  callbackURL: baseCallbackURL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 Processing Google OAuth for:', profile.emails[0].value);
    
    // Process Google auth using shared helper (authenticates user first)
    const user = await processGoogleAuth(profile, db.get.bind(db), db.run.bind(db));
    
    console.log('✅ User processed:', { id: user.id, email: user.email, role: user.role, is_admin: user.is_admin });
    
    // Return user - role checking will happen in callback route
    return done(null, user);
  } catch (error) {
    console.error('❌ OAuth processing error:', error);
    console.error('Error stack:', error.stack);
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Cache for deserializeUser to reduce database queries (only for localhost)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Clear cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of userCache.entries()) {
    if (now - data.timestamp > CACHE_TTL) {
      userCache.delete(id);
    }
  }
}, CACHE_TTL);

passport.deserializeUser((id, done) => {
  const isLocalhost = process.env.VERCEL !== '1';
  
  // Check cache first (only for localhost to reduce DB queries)
  if (isLocalhost && userCache.has(id)) {
    const cached = userCache.get(id);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      // Cache hit - return cached user (no logging for cached hits)
      return done(null, cached.user);
    } else {
      // Cache expired
      userCache.delete(id);
    }
  }
  
  db.get('SELECT * FROM students WHERE id = ?', [id], (err, student) => {
    if (err) {
      console.error('❌ deserializeUser error:', err);
      return done(err);
    }
    if (!student) {
      console.error('❌ deserializeUser: Student not found for id:', id);
      return done(null, false);
    }

    // Ensure role is set (fallback for legacy data)
    // Handle both boolean and integer is_admin
    if (!student.role) {
      student.role = (student.is_admin === 1 || student.is_admin === true) ? 'admin' : 'student';
    }
    
    // Normalize is_admin to integer for consistency
    if (typeof student.is_admin === 'boolean') {
      student.is_admin = student.is_admin ? 1 : 0;
    }
    
    // Keep isAdmin for backward compatibility
    student.isAdmin = student.role === 'admin';
    
    // Cache user data for localhost (reduces DB queries)
    if (isLocalhost) {
      userCache.set(id, {
        user: student,
        timestamp: Date.now()
      });
    }
    
    // Only log errors - removed excessive success logging for cleaner localhost experience
    
    done(null, student);
  });
});

// Email transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to render OAuth error page
function renderOAuthError(message, returnUrl = '/') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Error</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #244855 0%, #000000 100%); color: white; }
        .error-box { background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 1rem; max-width: 600px; text-align: center; }
        code { background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 0.25rem; display: block; margin: 1rem 0; }
        a { color: #60a5fa; text-decoration: none; display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.2); border-radius: 0.5rem; }
        a:hover { background: rgba(255,255,255,0.3); }
      </style>
    </head>
    <body>
      <div class="error-box">
        <h1>⚠️ ${message}</h1>
        <p><a href="${returnUrl}">← Return</a></p>
      </div>
    </body>
    </html>
  `;
}

// Helper function to render login page
function renderLoginPage(title, description, loginUrl, returnUrl = '/') {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - LM Mastermind</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        * { font-family: 'Poppins', sans-serif; }
        body { background: linear-gradient(135deg, #244855 0%, #000000 100%); min-height: 100vh; }
      </style>
    </head>
    <body>
      <div class="min-h-screen flex items-center justify-center px-4">
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">${title}</h2>
            <p class="text-gray-600">${description}</p>
          </div>

          <div class="space-y-4">
            <a href="${loginUrl}" class="w-full flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
              <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              By signing in, you agree to our
              <a href="/privacy.html" class="text-[#244855] hover:underline">Privacy Policy</a>
              and
              <a href="/terms.html" class="text-[#244855] hover:underline">Terms of Service</a>
            </p>
            <a href="${returnUrl}" class="mt-4 inline-block text-sm text-gray-500 hover:text-gray-700">← Back to Home</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Admin login page route - shows login UI
app.get('/admin/login', (req, res) => {
  // Check if OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).send(renderOAuthError('Google OAuth Not Configured', '/'));
  }
  
  // Render login page
  return res.send(renderLoginPage(
    'Admin Login',
    'Sign in with your Google account to access the admin dashboard',
    '/admin/login/auth',
    '/'
  ));
});

// Admin login auth route - initiates Google OAuth
app.get('/admin/login/auth', (req, res, next) => {
  // Set expected role in session and ensure it's saved
  req.session.expectedRole = 'admin';
  req.session.save((err) => {
    if (err) {
      console.error('Error saving expectedRole:', err);
      return res.status(500).send(renderOAuthError('Failed to initialize login. Please try again.', '/'));
    }
    console.log('✅ Expected role set to admin, initiating OAuth...');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });
});

// Student login page route - shows login UI
app.get('/student/login', (req, res) => {
  // Check if OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).send(renderOAuthError('Google OAuth Not Configured', '/'));
  }
  
  // Render login page
  return res.send(renderLoginPage(
    'Student Login',
    'Sign in with your Google account to access your course materials',
    '/student/login/auth',
    '/'
  ));
});

// Student login auth route - initiates Google OAuth
app.get('/student/login/auth', (req, res, next) => {
  // Set expected role in session and ensure it's saved
  req.session.expectedRole = 'student';
  req.session.save((err) => {
    if (err) {
      console.error('Error saving expectedRole:', err);
      return res.status(500).send(renderOAuthError('Failed to initialize login. Please try again.', '/'));
    }
    console.log('✅ Expected role set to student, initiating OAuth...');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });
});

// Google OAuth callback - handles both admin and student
app.get('/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: false,
      failureFlash: false 
    })(req, res, (err) => {
      if (err) {
        console.error('❌ OAuth callback error:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        return res.status(403).send(renderOAuthError('Authentication failed. Please try again.', '/'));
      }
      
      // Check if authentication failed due to role mismatch or other reason
      if (!req.user) {
        console.error('❌ OAuth callback: req.user is null');
        return res.status(403).send(renderOAuthError('You are not authorised for this section.', '/'));
      }
      
      console.log('✅ OAuth callback: User authenticated:', { 
        id: req.user.id, 
        email: req.user.email, 
        role: req.user.role, 
        is_admin: req.user.is_admin 
      });
      
      // Get expected role from session (or default to student)
      // Store it in a variable before deleting from session
      const expectedRole = req.session.expectedRole || 'student';
      console.log('🔍 Expected role from session:', expectedRole, 'Session data:', {
        hasSession: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        expectedRole: req.session?.expectedRole,
        passport: req.session?.passport
      });
      
      // Verify role matches - handle both boolean and integer is_admin
      const userRole = req.user.role || (req.user.is_admin === 1 || req.user.is_admin === true ? 'admin' : 'student');
      console.log('🔍 User role determined:', userRole);
      
      // Only enforce role mismatch if:
      // 1. User is trying to access admin but is not admin
      // 2. Don't block if user is admin trying to access student (they can access both)
      if (expectedRole === 'admin' && userRole !== 'admin') {
        console.warn('⚠️  Admin access denied:', { userRole, expectedRole, userId: req.user.id, email: req.user.email });
        delete req.session.expectedRole;
        req.logout(() => {
          return res.status(403).send(renderOAuthError('You are not authorised for this section. Admin access required.', '/'));
        });
        return;
      }
      
      // If user is admin but trying to access student area, that's fine - allow it
      // If user is student and trying to access student area, that's fine - allow it
      console.log('✅ Role check passed:', { userRole, expectedRole });
      
      // Don't delete expectedRole yet - we need it for the redirect
      // It will be cleaned up after redirect
      
      // Explicitly log the user in
      // For cookie-session on Vercel, we need to manually serialize the user
      // Passport's req.login() should handle this, but cookie-session needs explicit setting
      
      // Serialize user ID (what passport.serializeUser does)
      const serializedUserId = req.user.id;
      
      // Set passport.user in session BEFORE calling req.login
      // This ensures it's in the session when req.login tries to save
      req.session.passport = req.session.passport || {};
      req.session.passport.user = serializedUserId;
      
      console.log('🔧 Setting session before req.login:', {
        userId: req.user.id,
        serializedUserId: serializedUserId,
        hasPassport: !!req.session.passport,
        passportUser: req.session.passport?.user
      });
      
      // Now call req.login which will trigger serializeUser (but we've already set it)
      req.login(req.user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return res.status(500).send(renderOAuthError('Failed to establish session. Please try again.', '/'));
        }
        
        // Double-check passport.user is set after req.login
        if (!req.session.passport || !req.session.passport.user) {
          console.warn('⚠️  passport.user not set after req.login, setting manually');
          req.session.passport = req.session.passport || {};
          req.session.passport.user = serializedUserId;
        }
        
        console.log('✅ User logged in, session state:', {
          userId: req.user.id,
          email: req.user.email,
          role: userRole,
          hasSession: !!req.session,
          hasPassport: !!req.session.passport,
          passportUser: req.session.passport?.user,
          sessionKeys: req.session ? Object.keys(req.session) : []
        });
        
        // Clean up expectedRole now that we're about to redirect
        delete req.session.expectedRole;
        
        // For cookie-session on Vercel, we need to ensure the cookie is actually sent with the redirect
        // cookie-session auto-saves when the response is sent, but we need to ensure it happens
        // The key is to ensure the session is marked as modified
        
        // Verify session state before redirect
        console.log('✅ Session before redirect:', {
          hasPassport: !!req.session.passport,
          passportUser: req.session.passport?.user,
          sessionKeys: req.session ? Object.keys(req.session) : []
        });
        
        // Ensure session is saved by touching it (marks as modified)
        // This ensures cookie-session will write the cookie
        if (req.session && req.session.touch) {
          req.session.touch();
        }
        
        // Force session to be saved by accessing it (cookie-session auto-saves on access)
        // Modify session slightly to ensure it's marked as modified
        req.session._lastAccess = Date.now();
        
        console.log('✅ Redirecting...', {
          userId: req.user.id,
          email: req.user.email,
          role: userRole,
          expectedRole: expectedRole,
          hasPassport: !!req.session.passport,
          passportUser: req.session.passport?.user
        });
        
        // For cookie-session, the cookie is automatically sent with the response
        // Redirect based on expectedRole (what user requested) not actual role
        // This allows admins to login as students if they want
        if (expectedRole === 'admin') {
          // User requested admin login - go to admin dashboard
          console.log('✅ Redirecting to admin dashboard');
          res.redirect('/admin.html');
        } else {
          // User requested student login (or default) - go to student dashboard
          // Even if user is admin, if they clicked student login, send them to student dashboard
          console.log('✅ Redirecting to student dashboard');
          res.redirect('/?loggedIn=true');
        }
      });
    });
  }
);

// Legacy route for backward compatibility (redirects to student login)
app.get('/auth/google', (req, res) => {
  res.redirect('/student/login');
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Auth status endpoint
app.get('/auth/status', (req, res) => {
  // Debug logging for troubleshooting
  console.log('Auth status check:', {
    isAuthenticated: req.isAuthenticated(),
    hasUser: !!req.user,
    sessionId: req.sessionID,
    hasSession: !!req.session,
    hasPassport: !!(req.session && req.session.passport),
    passportUser: req.session?.passport?.user
  });
  
  if (req.isAuthenticated() && req.user) {
    // Ensure user object has all needed fields
    const userData = {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role || (req.user.is_admin === 1 ? 'admin' : 'student'),
      status: req.user.status
    };
    res.json({ user: userData });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Middleware to require admin role
function requireAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check role field
  const userRole = req.user.role || (req.user.is_admin === 1 ? 'admin' : 'student');
  
  if (userRole !== 'admin') {
    console.warn(`⚠️  Unauthorized admin API access attempt by: ${req.user.email} (role: ${userRole}) to ${req.path}`);
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  return next();
}

// Middleware to require student role
function requireStudent(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check role field
  const userRole = req.user.role || (req.user.is_admin === 1 ? 'admin' : 'student');
  
  if (userRole !== 'student') {
    console.warn(`⚠️  Unauthorized student API access attempt by: ${req.user.email} (role: ${userRole}) to ${req.path}`);
    return res.status(403).json({ error: 'Student access required' });
  }
  
  return next();
}

// API Routes

// Get public modules list (no authentication required)
app.get('/api/modules/public', (req, res) => {
  // Get all modules (1-7) with basic info
  const query = `
    SELECT 
      id,
      module_name,
      description,
      access_type
    FROM modules
    WHERE id <= 7
    ORDER BY id
  `;

  db.all(query, [], (err, modules) => {
    if (err) {
      console.error('Error fetching public modules:', err);
      // Return default modules if database query fails (for Vercel cold starts)
      const defaultModules = [
        { id: 1, module_name: 'Foundation & Financial Freedom Roadmap', description: '', access_type: 'requires_approval', unit_count: 6 },
        { id: 2, module_name: 'Market Understanding & Property Strategy', description: '', access_type: 'requires_approval', unit_count: 9 },
        { id: 3, module_name: 'Business Setup & Compliance Foundations', description: '', access_type: 'requires_approval', unit_count: 7 },
        { id: 4, module_name: 'Client Acquisition & Lettings Operations', description: '', access_type: 'requires_approval', unit_count: 8 },
        { id: 5, module_name: 'Property Management & Relationship Building', description: '', access_type: 'requires_approval', unit_count: 10 },
        { id: 6, module_name: 'End of Tenancy, Renewals & Compliance Updates', description: '', access_type: 'requires_approval', unit_count: 8 },
        { id: 7, module_name: 'Scaling, Marketing & Portfolio Growth', description: '', access_type: 'requires_approval', unit_count: 8 }
      ];
      return res.json({ modules: defaultModules });
    }

    // Add unit counts based on module ID
    const moduleUnitCounts = {
      1: 6,
      2: 9,
      3: 7,
      4: 8,
      5: 10,
      6: 8,
      7: 8
    };

    const modulesWithCounts = modules.map(module => ({
      ...module,
      unit_count: moduleUnitCounts[module.id] || 0
    }));

    res.json({ modules: modulesWithCounts });
  });
});

// Auto-approve Module 1 access (free module) - MUST be before catch-all routes
app.post('/api/unlock-module-1', requireStudent, (req, res) => {
  console.log('✅ Route /api/unlock-module-1 hit!');
  const studentId = req.user.id;
  console.log('Unlocking Module 1 for student:', studentId);

  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');

  if (useSupabase && supabase) {
    // Supabase version
    supabase.from('access_requests')
      .upsert({
        student_id: studentId,
        module_id: 1,
        status: 'approved'
      }, {
        onConflict: 'student_id,module_id'
      })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error unlocking Module 1 (Supabase):', error);
          return res.status(500).json({ error: error.message });
        }
        console.log('Module 1 unlocked successfully (Supabase)');
        res.json({ success: true, message: 'Module 1 access granted' });
      })
      .catch((err) => {
        console.error('Supabase catch error:', err);
        res.status(500).json({ error: err.message || 'Failed to unlock Module 1' });
      });
  } else {
    // SQLite version
    // Check if access request already exists
    db.get('SELECT * FROM access_requests WHERE student_id = ? AND module_id = 1', [studentId], (err, existing) => {
      if (err) {
        console.error('Database error (get):', err);
        return res.status(500).json({ error: err.message });
      }

      if (existing) {
        // Update existing request to approved
        db.run('UPDATE access_requests SET status = "approved", updated_at = CURRENT_TIMESTAMP WHERE student_id = ? AND module_id = 1',
          [studentId], function(err) {
          if (err) {
            console.error('Database error (update):', err);
            return res.status(500).json({ error: err.message });
          }
          console.log('Module 1 unlocked successfully (updated existing)');
          res.json({ success: true, message: 'Module 1 access granted' });
        });
      } else {
        // Create new approved access request for Module 1
        db.run('INSERT INTO access_requests (student_id, module_id, status, created_at, updated_at) VALUES (?, 1, "approved", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [studentId], function(err) {
          if (err) {
            console.error('Database error (insert):', err);
            return res.status(500).json({ error: err.message });
          }
          console.log('Module 1 unlocked successfully (new record)');
          res.json({ success: true, message: 'Module 1 access granted' });
        });
      }
    });
  }
});

// Get student dashboard data
app.get('/api/dashboard', requireStudent, (req, res) => {
  const studentId = req.user.id;

  // Get modules with access status - only modules 1-7
  // Module 1 is free but still requires authorization via unlockModule1 (access request)
  const query = `
    SELECT
      m.*,
      CASE
        WHEN ar.status IS NOT NULL THEN ar.status
        WHEN m.access_type = 'open' AND m.id != 1 THEN 'approved'
        ELSE 'not_requested'
      END as access_status,
      ar.admin_comment,
      p.progress_status,
      p.percentage_completed,
      p.last_updated as progress_updated
    FROM modules m
    LEFT JOIN access_requests ar ON m.id = ar.module_id AND ar.student_id = ?
    LEFT JOIN progress p ON m.id = p.module_id AND p.student_id = ?
    WHERE m.id <= 7
    ORDER BY m.id
  `;

  db.all(query, [studentId, studentId], (err, modules) => {
    if (err) return res.status(500).json({ error: err.message });

    // Double-check: Filter out any modules with ID > 7 (safety measure)
    const filteredModules = modules.filter(m => m.id <= 7);

    // Sanitize user data - remove admin flags for student dashboard
    const studentData = {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      status: req.user.status,
      created_at: req.user.created_at
      // Explicitly exclude isAdmin, is_admin, and any admin-related fields
    };

    res.json({
      student: studentData,
      modules: filteredModules
    });
  });
});

// Get admin dashboard data
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const queries = {
    students: 'SELECT COUNT(*) as count FROM students',
    pendingRequests: 'SELECT COUNT(*) as count FROM access_requests ar JOIN modules m ON ar.module_id = m.id WHERE ar.status = "pending" AND m.id <= 7',
    totalMessages: 'SELECT COUNT(*) as count FROM messages WHERE status = "unread"',
    recentRequests: `
      SELECT ar.*, s.full_name, s.email, m.module_name
      FROM access_requests ar
      JOIN students s ON ar.student_id = s.id
      JOIN modules m ON ar.module_id = m.id
      WHERE ar.status = 'pending' AND m.id <= 7
      ORDER BY ar.created_at DESC
      LIMIT 10
    `
  };

  const results = {};

  db.get(queries.students, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    results.students = row.count;

    db.get(queries.pendingRequests, [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      results.pendingRequests = row.count;

      db.get(queries.totalMessages, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        results.unreadMessages = row.count;

        db.all(queries.recentRequests, [], (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          results.recentRequests = rows;

          res.json(results);
        });
      });
    });
  });
});

// Request access to modules
app.post('/api/access-request',
  requireStudent,
  [
    body('modules').isArray({ min: 1 }).withMessage('At least one module must be selected'),
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phoneNumber').trim().isLength({ min: 10 }).withMessage('Valid phone number is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { modules, fullName, email, phoneNumber, message } = req.body;
    const studentId = req.user.id;
    const studentMessage = message ? message.trim() : null;

    // Validate that only modules 1-7 can be requested
    const invalidModules = modules.filter(id => id > 7 || id < 1);
    if (invalidModules.length > 0) {
      return res.status(400).json({ error: `Invalid module IDs: ${invalidModules.join(', ')}. Only modules 1-7 are available.` });
    }

    // Update student info
    db.run('UPDATE students SET full_name = ?, email = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [fullName, email, phoneNumber, studentId], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Create access requests
      if (useSupabase) {
        // Use Supabase - insert all at once
        const accessRequests = modules.map(moduleId => ({
          student_id: studentId,
          module_id: moduleId,
          status: 'pending',
          admin_comment: studentMessage || null
        }));
        
        supabase.from('access_requests').upsert(accessRequests, { onConflict: 'student_id,module_id' })
          .then(() => {
            // Send notification email to admin
            if (process.env.EMAIL_USER) {
              const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: process.env.ADMIN_EMAILS.split(',')[0],
                subject: 'New Access Request - LM Mastermind',
                html: `
                  <h2>New Access Request</h2>
                  <p><strong>Student:</strong> ${fullName}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Phone:</strong> ${phoneNumber}</p>
                  <p><strong>Modules Requested:</strong> ${modules.join(', ')}</p>
                  ${studentMessage ? `<p><strong>Student Message:</strong> ${studentMessage}</p>` : ''}
                  <p>Please review and approve/deny the request in the admin dashboard.</p>
                `
              };

              emailTransporter.sendMail(mailOptions, (error, info) => {
                if (error) console.error('Email error:', error);
              });
            }

            res.json({ success: true, message: 'Access request submitted successfully' });
          })
          .catch((err) => {
            console.error('Error creating access requests:', err);
            res.status(500).json({ error: err.message });
          });
        return;
      }
      
      // SQLite version
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO access_requests (student_id, module_id, status, admin_comment, updated_at)
        VALUES (?, ?, 'pending', ?, CURRENT_TIMESTAMP)
      `);

      let completed = 0;
      modules.forEach(moduleId => {
        stmt.run([studentId, moduleId, studentMessage], (err) => {
          if (err) console.error('Error creating access request:', err);
          completed++;
          if (completed === modules.length) {
            stmt.finalize();

            // Send notification email to admin
            if (process.env.EMAIL_USER) {
              const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: process.env.ADMIN_EMAILS.split(',')[0],
                subject: 'New Access Request - LM Mastermind',
                html: `
                  <h2>New Access Request</h2>
                  <p><strong>Student:</strong> ${fullName}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Phone:</strong> ${phoneNumber}</p>
                  <p><strong>Modules Requested:</strong> ${modules.join(', ')}</p>
                  ${studentMessage ? `<p><strong>Student Message:</strong> ${studentMessage}</p>` : ''}
                  <p>Please review and approve/deny the request in the admin dashboard.</p>
                `
              };

              emailTransporter.sendMail(mailOptions, (error, info) => {
                if (error) console.error('Email error:', error);
              });
            }

            res.json({ success: true, message: 'Access request submitted successfully' });
          }
        });
      });
    });
  });

// Admin approve/deny access request
app.post('/api/admin/access-request/:id',
  requireAdmin,
  [
    body('action').isIn(['approve', 'deny']).withMessage('Action must be approve or deny'),
    body('comment').optional().trim()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requestId = req.params.id;
    const { action, comment } = req.body;
    const status = action === 'approve' ? 'approved' : 'denied';

    if (useSupabase && supabase) {
      // Supabase version
      // First check if the request is for a valid module (1-7)
      supabase.from('access_requests')
        .select('module_id')
        .eq('id', requestId)
        .single()
        .then(({ data: request, error: fetchError }) => {
          if (fetchError) {
            return res.status(404).json({ error: 'Access request not found' });
          }
          
          if (!request || (request.module_id > 7 || request.module_id < 1)) {
            return res.status(400).json({ error: `Cannot process request for module ${request.module_id}. Only modules 1-7 are available.` });
          }

          // Update the access request status
          supabase.from('access_requests')
            .update({
              status: status,
              admin_comment: comment || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .then(({ data, error }) => {
              if (error) {
                return res.status(500).json({ error: error.message });
              }

              res.json({ success: true, message: `Request ${status}` });
            });
        })
        .catch(err => {
          console.error('Error processing access request:', err);
          res.status(500).json({ error: err.message || 'Failed to process access request' });
        });
    } else {
      // SQLite version
      // First check if the request is for a valid module (1-7)
      db.get('SELECT module_id FROM access_requests WHERE id = ?', [requestId], (err, request) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!request) return res.status(404).json({ error: 'Access request not found' });
        
        if (request.module_id > 7 || request.module_id < 1) {
          return res.status(400).json({ error: `Cannot process request for module ${request.module_id}. Only modules 1-7 are available.` });
        }

        db.run('UPDATE access_requests SET status = ?, admin_comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, comment, requestId], function(err) {
          if (err) return res.status(500).json({ error: err.message });

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Access request not found' });
          }

          res.json({ success: true, message: `Request ${status}` });
        });
      });
    }
  });

// Update progress
app.post('/api/progress',
  requireStudent,
  [
    body('moduleId').isInt().withMessage('Valid module ID required'),
    body('status').isIn(['not_started', 'in_progress', 'completed']).withMessage('Invalid status'),
    body('percentage').isInt({ min: 0, max: 100 }).withMessage('Percentage must be 0-100')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { moduleId, status, percentage } = req.body;
    const studentId = req.user.id;

    // Validate that only modules 1-7 can have progress tracked
    if (moduleId > 7 || moduleId < 1) {
      return res.status(400).json({ error: `Invalid module ID: ${moduleId}. Only modules 1-7 are available.` });
    }

    // Use Supabase-compatible query (INSERT ... ON CONFLICT for PostgreSQL)
    if (useSupabase && supabase) {
      // For Supabase, use upsert directly
      const progressData = {
        student_id: studentId,
        module_id: moduleId,
        progress_status: status,
        percentage_completed: percentage,
        last_updated: new Date().toISOString()
      };
      
      supabase.from('progress')
        .upsert(progressData, { onConflict: 'student_id,module_id' })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error updating progress:', error);
            return res.status(500).json({ error: error.message });
          }
          res.json({ success: true, message: 'Progress updated' });
        })
        .catch(err => {
          console.error('Error updating progress:', err);
          res.status(500).json({ error: err.message });
        });
    } else {
      // SQLite syntax
      db.run(`INSERT OR REPLACE INTO progress (student_id, module_id, progress_status, percentage_completed, last_updated)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [studentId, moduleId, status, percentage], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ success: true, message: 'Progress updated' });
      });
    }
  });

// Send message to admin
app.post('/api/message',
  requireStudent,
  [
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const studentId = req.user.id;

    db.run('INSERT INTO messages (student_id, message_content) VALUES (?, ?)',
      [studentId, message], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ success: true, message: 'Message sent successfully' });
    });
  });

// Get messages for admin
app.get('/api/admin/messages', requireAdmin, (req, res) => {
  const query = `
    SELECT m.*, s.full_name, s.email
    FROM messages m
    JOIN students s ON m.student_id = s.id
    ORDER BY m.created_at DESC
  `;

  db.all(query, [], (err, messages) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(messages);
  });
});

// Get all students for admin
app.get('/api/admin/students', requireAdmin, (req, res) => {
  const query = `
    SELECT
      s.*,
      COUNT(CASE WHEN ar.status = 'approved' AND m.id <= 7 THEN 1 END) as approved_modules,
      COUNT(CASE WHEN ar.status = 'pending' AND m.id <= 7 THEN 1 END) as pending_requests
    FROM students s
    LEFT JOIN access_requests ar ON s.id = ar.student_id
    LEFT JOIN modules m ON ar.module_id = m.id
    WHERE s.is_admin = 0
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;

  db.all(query, [], (err, students) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(students);
  });
});

// Get individual student details with module access levels
app.get('/api/admin/students/:id', requireAdmin, (req, res) => {
  const studentId = req.params.id;

  // Get student basic info
  db.get('SELECT * FROM students WHERE id = ? AND is_admin = 0', [studentId], (err, student) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Get all modules with access status
    db.all(`
      SELECT 
        m.id,
        m.module_name,
        m.description,
        m.access_type,
        ar.status as access_status,
        ar.admin_comment,
        ar.created_at as request_date,
        ar.updated_at as status_updated
      FROM modules m
      LEFT JOIN access_requests ar ON m.id = ar.module_id AND ar.student_id = ?
      ORDER BY m.id
    `, [studentId], (err, modules) => {
      if (err) return res.status(500).json({ error: err.message });

      // Get all messages from this student
      db.all('SELECT * FROM messages WHERE student_id = ? ORDER BY created_at DESC', [studentId], (err, messages) => {
        if (err) return res.status(500).json({ error: err.message });

        // Format modules with access status
        const formattedModules = modules.map(module => {
          let accessStatus = 'not_requested';
          if (module.access_type === 'open') {
            accessStatus = 'approved';
          } else if (module.access_status) {
            accessStatus = module.access_status;
          }

          return {
            id: module.id,
            module_name: module.module_name,
            description: module.description,
            access_type: module.access_type,
            access_status: accessStatus,
            admin_comment: module.admin_comment || null,
            request_date: module.request_date || null,
            status_updated: module.status_updated || null
          };
        });

        res.json({
          ...student,
          modules: formattedModules,
          messages: messages || []
        });
      });
    });
  });
});

// Mark message as read
app.post('/api/admin/message/:id/read', requireAdmin, (req, res) => {
  db.run('UPDATE messages SET status = "read", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ success: true });
  });
});

// Admin page route - STRICT admin-only access
app.get('/admin.html', (req, res, next) => {
  // First check authentication
  if (!req.isAuthenticated()) {
    return res.redirect('/admin/login');
  }
  
  // Check role field
  const userRole = req.user.role || (req.user.is_admin === 1 ? 'admin' : 'student');
  
  if (userRole !== 'admin') {
    console.warn(`⚠️  Unauthorized admin access attempt by: ${req.user.email} (role: ${userRole})`);
    return res.status(403).send(renderOAuthError('You are not authorised for this section. Admin access required.', '/'));
  }
  
  // Admin access granted - serve the file
  next();
});

// Cleanup function to remove modules 8-14 on startup
function cleanupModules() {
  // Skip cleanup in Vercel serverless (database resets anyway)
  if (process.env.VERCEL === '1') {
    return;
  }

  db.run('DELETE FROM modules WHERE id > 7', (err) => {
    if (err) {
      console.error('Error cleaning up modules 8-14:', err);
    } else {
      db.get('SELECT changes() as deleted', [], (err, row) => {
        if (!err && row && row.deleted > 0) {
          console.log(`✅ Cleaned up ${row.deleted} module(s) with ID > 7`);
        }
      });
    }
  });
  
  // Also clean up any access requests and progress for modules 8-14
  db.run('DELETE FROM access_requests WHERE module_id > 7', (err) => {
    if (err) {
      console.error('Error cleaning up access requests for modules 8-14:', err);
    }
  });
  
  db.run('DELETE FROM progress WHERE module_id > 7', (err) => {
    if (err) {
      console.error('Error cleaning up progress for modules 8-14:', err);
    }
  });
}

// Run cleanup on startup (only in non-Vercel environments)
if (process.env.VERCEL !== '1') {
  cleanupModules();
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files (but exclude login routes and API routes)
app.use((req, res, next) => {
  // Skip static file serving for specific routes that have their own handlers
  if (req.path === '/admin/login' || 
      req.path === '/student/login' || 
      req.path === '/admin/login/auth' || 
      req.path === '/student/login/auth' ||
      req.path.startsWith('/api/') ||
      req.path.startsWith('/auth/')) {
    return next();
  }
  
  // Use express.static for all other requests
  const staticMiddleware = express.static(path.join(__dirname), {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    index: false // Don't auto-serve index.html, we'll handle that in catch-all
  });
  
  staticMiddleware(req, res, next);
});

// Catch all handler - serve index.html for SPA
app.use((req, res, next) => {
  // Skip if it's an API route, auth route, health check, or login routes
  if (req.path.startsWith('/api/') ||
      req.path.startsWith('/auth/') ||
      req.path === '/health' ||
      req.path === '/admin/login' ||
      req.path === '/student/login' ||
      req.path === '/admin/login/auth' ||
      req.path === '/student/login/auth') {
    return next();
  }

  // Skip if it's a static file request (has file extension)
  const hasExtension = /\.[^/]+$/.test(req.path);
  if (hasExtension) {
    return next(); // Let Express handle 404 for missing static files
  }

  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      next(err);
    }
  });
});

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 LM Mastermind server running at http://localhost:${PORT}`);
    console.log(`📊 Admin emails: ${process.env.ADMIN_EMAILS || 'Not configured'}`);
    console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'Enabled' : 'Disabled'}`);
    console.log(`🔒 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
    console.log(`✅ API Routes registered: /api/unlock-module-1, /api/dashboard, /api/access-request`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close();
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
}

// Export app for Vercel serverless functions
module.exports = app;
