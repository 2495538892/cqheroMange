const express = require('express');
const dbHelper = require('./libs/03.dbHelper');
const multer = require('multer');
const app = express();
const path = require('path')
app.use(express.static('views'))

// 路由一:查询英雄;
app.get('/herolist', (req, res) => {

    const pagesize =+req.query.pagesize;
    const pagenum = +req.query.pagenum;

    // 查询的条件
    let query = req.query.query;

    // 找到所以的数据;
    dbHelper.find('cqlist', {}, result => {
            result=result.reverse()
        // 赛选符合条件的数据;
        const temArr = result.filter(v => {
            if (v.heroName.indexOf(query) != -1 || v.skillName.indexOf(query) != -1) {
                return true;
            }
        })

        // 计算初始数;
        const stratpage = parseInt((pagenum - 1) * pagesize);

        // 计算结束数;
        const endpage = parseInt(stratpage + pagesize);

        // 计算总页数;
        const totalPage = parseInt(temArr.length / pagesize);
        // 根据页码显示多少天符合条件的数据;

        let list = [];
        for (var i = stratpage; i < endpage; i++) {
            if (temArr[i]) {
                list.push(temArr[i])
            }
        }

        res.send({
            totalPage,
            list
        })
    })


})

// 路由二:英雄详情;
app.get('/hreoDetail', (req, res) => {
    // 获取id;
    const id = req.query.id;
    // 查询的条件;
    dbHelper.find('cqlist', { _id: dbHelper.ObjectId(id) }, result => {
        // 返回数据;
        res.send(result[0])
        console.log(result)
    })
})

// 路由三:删除英雄;
app.get('/deleteHero', (req, res) => {

    // 获取删除的id;
    const id = req.query.id;

    // 赛选条件;
    dbHelper.deleteOne('cqlist', { _id: dbHelper.ObjectId(id) }, result => {
        // 返回结果;
        res.send(result)
    })

})

// 路由四:新增英雄;
// 图片上传保存在哪里;
const upload = multer({ dest: 'views/imgs/' });
app.post('/addHero', upload.single('heroIcon'), (req, res) => {

    const heroName = req.body.heroName;
    const skillName = req.body.skillName;
    // 因为我们在静态托管的时候已经指向views,如果我直接使用req.file.path这个路径的话里面又写了views,所以可以会用问题,所以用path.join拼接;
    const heroIcon = path.join('imgs', req.file.filename);
    dbHelper.insertOne('cqlist', { heroName: heroName, skillName: skillName, heroIcon: heroIcon }, result => {
        console.log(result)
        res.send(req.file)
    })
})

// 路由五:修改英雄
app.post('/updateHero', upload.single('heroIcon'), (req, res) => {
    const heroName = req.body.heroName;
    const heroskill = req.body.heroskill;
    const id=req.body.id;
    // 因为我们在静态托管的时候已经指向views,如果我直接使用req.file.path这个路径的话里面又写了views,所以可以会用问题,所以用path.join拼接;
    const heroIcon = path.join('imgs', req.file.filename);
    dbHelper.updateOne('cqlist', {_id:dbHelper.ObjectId(id)},{ heroName: heroName, heroskill: heroskill, heroIcon: heroIcon }, result => {
        console.log(result)
        res.send(result)
    })
})

app.listen('4399') 