const express = require('express');
const dbHelper = require('./libs/03.dbHelper');
const multer = require('multer');
const bodyParser = require('body-parser')
// 验证码包
var svgCaptcha = require('svg-captcha');
//  seesion包
var cookieSession = require('cookie-session')

const app = express();
const path = require('path')

app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('views'))

// 路由一:查询英雄;
app.get('/herolist', (req, res) => {

    const pagesize = +req.query.pagesize;
    const pagenum = +req.query.pagenum;

    // 查询的条件
    let query = req.query.query;

    // 找到所以的数据;
    dbHelper.find('cqlist', {}, result => {
        result = result.reverse()
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
    const id = req.body.id;
    // 当用户只修改文字不修改图片的时候,服务器拿不到图片的路径,此时服务器会崩溃,所以我们要判断是否修改了图片;
    let data = {
        heroName,
        heroskill,
    }
    // 这个是判断用户是否修改了图片,如果修改了图片这个会有值,没有就undefined;如果修改了我们才去拿他的路径; 
    if (req.file) {
        // 因为我们在静态托管的时候已经指向views,如果我直接使用req.file.path这个路径的话里面又写了views,所以可以会用问题,所以用path.join拼接;
        const heroIcon = path.join('imgs', req.file.filename);
        data.heroIcon = heroIcon;
    }

    dbHelper.updateOne('cqlist', { _id: dbHelper.ObjectId(id) }, data, result => {
        console.log(result)
        res.send(result)
    })
})


// 路由六:用户注册(利用到的模块:密码加密.抽取出来的增删改查)

app.post('/register', (req, res) => {
    // 获取用户传过来的数据;
    const data = req.body;
    const userName = data.userName;
    console.log(userName)
    // 拿到数据查询是否被注册;
    dbHelper.find('uselist', { userName }, result => {
        if (result.length === 0) {
            dbHelper.insertOne('uselist', data, result => {
                res.send({
                    msg:'success',
                    code:200
                })
            })
        } else {
            res.send({
                msg: '已被注册'
            })
        }
    })
})

//-----------------------------------------------------------------------------------------------------

//作用: 是为了能让每次请求验证码生成的具体验证存储在session里面所导入的session;
//  登录的时候需要判断验证码是否正确,所以用过cook-seesion模块在储存验证,然后在跟用户传过来的验证码进行比较;
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//  路由七:验证码
app.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create();
    // 这里就是就是把具体生成的验证码存到session里面;
    req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200).send(captcha.data);
});


//  路由八:登录(利用到的模块:session,svg(验证码))
app.post('/login', (req, res) => {

    const userName = req.body.userName;
    const userPassword = req.body.userPassword;
    const vCode = req.body.vCode
    console.log(userName)

    if (vCode === req.session.captcha) {
        dbHelper.find('uselist', { userName, userPassword }, result => {
            if (result.length == 0) {
                res.send({
                    msg:'faile',
                    code:400
                })
            } else {
                res.send({
                    msg: 'success',
                    userName,
                    code: 200
                })
            }
        })

    } else {
        res.send({
            msg: '验证码不正确'
        })
    }


})


// 路由九:登出
app.get('/loginout',(req,res)=>{
    req.session = null;
    res.send({
        msg:'success',
        code:200
    })
})


app.listen('4399') 