/**
 * Manual MongoDB Commands to Fix Index Issue
 * 
 * Run these commands in MongoDB Compass, MongoDB Shell, or any MongoDB client
 * Replace 'your-database-name' with your actual database name
 */

// 1. Connect to your database
use('ai-job'); // Replace with your actual database name

// 2. Check current indexes
db.resume_generation_sessions.getIndexes();

// 3. Drop the problematic index
db.resume_generation_sessions.dropIndex({"generated_resumes.generation_id": 1});

// 4. Create new sparse unique index
db.resume_generation_sessions.createIndex(
  {"generated_resumes.generation_id": 1}, 
  {
    unique: true, 
    sparse: true,
    name: "generated_resumes_generation_id_sparse_unique"
  }
);

// 5. Optional: Check for documents with null generation_id values
db.resume_generation_sessions.countDocuments({"generated_resumes.generation_id": null});

// 6. Optional: Remove null generation_id entries (if you want to clean them up)
db.resume_generation_sessions.updateMany(
  {"generated_resumes.generation_id": null},
  {$pull: {"generated_resumes": {"generation_id": null}}}
);

// 7. Verify the new index
db.resume_generation_sessions.getIndexes();
