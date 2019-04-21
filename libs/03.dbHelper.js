/**
 * 封装的时机
 * 1. 多个地方要调用
 * 2. 简化编码
 * 3. 懒得写代码（语法比较复杂，不想重复写，也可以封装）
 */
// 通过mongodb模块获取一个客户端对象
const MongoClient = require('mongodb').MongoClient
// mongodb这个第三方模块 提供了一个ObjectId方法
const ObjectId = require('mongodb').ObjectId

// 数据库地址
const url = 'mongodb://127.0.0.1:27017'

// 库的名字
// 一般一个项目 用到的库 就是同一个
const dbName = 'myproject'

// 暴露 出去
module.exports = {
  // 查询数据
  // 参数1 集合名
  // 参数2 查询条件
  // 参数3 回调函数
  find(collectionName, query, callback) {
    MongoClient.connect(url, (err, client) => {
      // 连接成功数据库之后 会 触发
      // console.log('数据库连上啦')
      // 选择使用的数据库
      const db = client.db(dbName)
      // 选择使用呢的集合
      const collection = db.collection(collectionName)
      // 插入多条数据
      // find({})对象是查询的条件
      // collection.find({}).toArray((err, docs) => {
      collection.find(query).toArray((err, docs) => {
        callback(docs)
        // 关闭数据库连接
        client.close()
      })
    })
  },
  // 插入数据
  // 参数1 集合名
  // 参数2 插入的数据
  // 参数3 回调函数
  insertOne(collectionName, insertData, callback) {
    MongoClient.connect(url, (err, client) => {
      // 选择使用的数据库
      const db = client.db(dbName)
      // 选择使用呢的集合
      const collection = db.collection(collectionName)
      // 插入多条数据
      collection.insertOne(insertData, (err, results) => {
        // console.log(results)
        callback(results)
        // 关闭数据库连接
        client.close()
      })
    })
  },
  // 修改数据
  // 参数1 集合名
  // 参数2 查询条件
  // 参数3 修改的内容
  // 参数4 回调函数
  updateOne(collectionName, query, update, callback) {
    MongoClient.connect(url, (err, client) => {
      // 选择使用的数据库
      const db = client.db(dbName)
      // 选择使用的集合
      const collection = db.collection(collectionName)
      // 调用更新数据的方法
      collection.updateOne(query, { $set: update }, (err, result) => {
        callback(result)
        // 关闭数据库连接
        client.close()
      })
    })
  },
  // 删除数据
  // 参数1 集合名
  // 参数2 查询条件
  // 参数3 回调函数
  deleteOne(collectionName, query, callback) {
    MongoClient.connect(url, (err, client) => {
      // 选择使用的数据库
      const db = client.db(dbName)
      // 选择使用的集合
      const collection = db.collection(collectionName)
      // 调用更新数据的方法
      collection.deleteOne(query, (err, result) => {
        callback(result)
        // 关闭数据库连接
        client.close()
      })
    })
  },
  // 暴露mongodb的ObjectId方法即可
  ObjectId
}
