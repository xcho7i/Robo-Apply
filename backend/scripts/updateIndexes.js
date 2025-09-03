#!/usr/bin/env node

/**
 * MongoDB Index Update Script
 * 
 * This script fixes the duplicate key error by:
 * 1. Dropping the existing problematic index on generated_resumes.generation_id
 * 2. Creating a new sparse unique index that allows multiple null values
 * 3. Optionally cleaning up any existing null values
 */

const mongoose = require('mongoose')
require('dotenv').config()

async function updateIndexes() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...')
    const dbUrl = process.env.DB_URL || process.env.MONGODB_URI
    const dbName = process.env.DB_NAME
    
    if (!dbUrl) {
      throw new Error('DB_URL or MONGODB_URI environment variable is required')
    }
    
    await mongoose.connect(dbUrl, {
      dbName: dbName
    })
    
    const db = mongoose.connection.db
    const collection = db.collection('resume_generation_sessions')
    
    console.log('Connected to database:', db.databaseName)
    
    // Check existing indexes
    console.log('\n--- Checking existing indexes ---')
    const existingIndexes = await collection.indexes()
    console.log('Current indexes:')
    existingIndexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: ${JSON.stringify(index)}`)
    })
    
    // Drop the problematic index if it exists
    console.log('\n--- Dropping problematic index ---')
    try {
      await collection.dropIndex({ "generated_resumes.generation_id": 1 })
      console.log('✅ Successfully dropped existing index on generated_resumes.generation_id')
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist (already dropped or never existed)')
      } else {
        console.error('❌ Error dropping index:', error.message)
      }
    }
    
    // Create new sparse unique index
    console.log('\n--- Creating new sparse unique index ---')
    try {
      await collection.createIndex(
        { "generated_resumes.generation_id": 1 },
        { 
          unique: true, 
          sparse: true,
          name: "generated_resumes_generation_id_sparse_unique"
        }
      )
      console.log('✅ Successfully created sparse unique index on generated_resumes.generation_id')
    } catch (error) {
      console.error('❌ Error creating new index:', error.message)
    }
    
    // Check for documents with null generation_id values
    console.log('\n--- Checking for documents with null generation_id values ---')
    const docsWithNullIds = await collection.countDocuments({
      "generated_resumes.generation_id": null
    })
    
    if (docsWithNullIds > 0) {
      console.log(`⚠️  Found ${docsWithNullIds} documents with null generation_id values`)
      
      // Option to clean up null values
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise(resolve => {
        rl.question('Do you want to remove null generation_id entries? (y/N): ', resolve)
      })
      rl.close()
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('Removing null generation_id entries...')
        const result = await collection.updateMany(
          { "generated_resumes.generation_id": null },
          { $pull: { "generated_resumes": { "generation_id": null } } }
        )
        console.log(`✅ Removed null entries from ${result.modifiedCount} documents`)
      } else {
        console.log('ℹ️  Skipped cleanup. Null values will be ignored by the sparse index.')
      }
    } else {
      console.log('✅ No documents with null generation_id values found')
    }
    
    // Verify new indexes
    console.log('\n--- Verifying updated indexes ---')
    const updatedIndexes = await collection.indexes()
    console.log('Updated indexes:')
    updatedIndexes.forEach(index => {
      if (JSON.stringify(index.key).includes('generation_id')) {
        console.log(`  - ${JSON.stringify(index.key)}: ${JSON.stringify(index)}`)
      }
    })
    
    console.log('\n🎉 Index update completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Restart your application')
    console.log('2. Test the uploadBaseResume and storeJobDetails endpoints')
    console.log('3. The duplicate key error should now be resolved')
    
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the script
if (require.main === module) {
  updateIndexes()
    .then(() => {
      console.log('\n✅ Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = updateIndexes
