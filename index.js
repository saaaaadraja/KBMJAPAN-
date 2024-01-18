const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const {v4: uuidv4} = require('uuid');
var nodemailer = require('nodemailer');
const { dirname } = require('path');
const path = require('path');


const app = express();

const port = 3001 || process.env.PORT ;

const uri = "mongodb+srv://raja_saad:raja1234@node1.qd9xb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri,{
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
client.connect()
.then(()=>{
  app.listen(port,()=>{
    console.log('server connected successfully....');
  });
})
 .catch((err)=>console.log(err));
 var db = client.db('node1');


app.use(cors({
   origin: '*',
  methods: [
    'GET',
    'POST',
  ],
  allowedHeaders: [
    'Content-Type',
  ],
  credentials:true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
const storage = multer.diskStorage({
  
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()
    cb(null, uniqueSuffix+file.originalname)
  }
})

const upload = multer({ storage: storage })


app.post('/login', (req,res)=>{
  db.collection('myAdmin').findOne({name:'admin'})
  .then(async (result)=>{
    var passwordIsValid = await bcrypt.compareSync(
      req.body.password,
      result.password
      );
      
    if (!passwordIsValid) {
      return res.status(401)
        .send({
          accessToken: null,
          message: "Invalid user name or Password!"
        });
    }

    var token = jwt.sign({id: result._id},'THISISMYSECRETKEYAPIFORAQUABIRDAPP');

    return res.cookie("access_token", token,  { httpOnly: true, sameSite:'none' ,secure: true, maxAge: 3600000 }).status(200).send({
        message: "Login successfull...",
      });
  })
  .catch((err)=> {
    console.log(err);
    return res.status(404)
  .send({
    message: "Invalid user name or Password!"
  })})
 

  
   
})



app.get('/logout',(req,res)=>{
  return res
  .clearCookie("access_token")
  .status(200)
  .json({ message: "Successfully logged out 😏 🍀" });
})

const authorization = (req, res, next) => {
  let token = '';
if ( req.headers.cookie && req.headers.cookie.split('=')[0] == "access_token") {
  token = req.headers.cookie.split('=')[1];
}else if (req.headers.cookie && req.headers.cookie.split(';')[2] && req.headers.cookie.split(';')[2].split('=')[0] == "access_token") {
  token = req.headers.cookie.split(';')[2].split('=')[1];
}else{
token='';
}
    if (token == '') {
      return res.sendStatus(403);
    }
    try {
     jwt.verify(token, "THISISMYSECRETKEYAPIFORAQUABIRDAPP");
      return next();
    } catch {
      return res.sendStatus(403);
    }
  };

  app.get("/protected", authorization, (req, res) => {
    return res.status(200).send('Ok');
  });

app.post('/add-product',upload.array("files"),(req,res)=>{
 const data = JSON.parse(req.body.data);
 const data1 = JSON.parse(req.body.data1);
 let params = {
  _id:uuidv4(),
  displayImage: `${req.protocol}://${req.get('host')}/uploads/${req.files[(req.files.length-1)].filename}`,
  M3 : data.M3,
  bodyType : data.bodyType,
  chassisNo : data.chassisNo,
  city : data.city,
  country : data.country,
  dimension : data.dimension,
  doors : data.doors,
  drive : data.drive,
  engineCode : data.engineCode,
  engineSize : data.engineSize,
  extColor : data.extColor,
  fuel : data.fuel,
  make : data.make,
  manufacture : data.manufacture,
  maxCapacity : data.maxCapacity,
  mileage : data.mileage,
  model : data.model,
  modelCode : data.modelCode,
  price : data.price,
  refNo : data.refNo,
  registration : data.registration,
  seats : data.seats,
  steering : data.steering,
  transmission : data.transmossion,
  vehicleName : data.vehicleName,
  version : data.version,
  weight : data.weight,
  images : [],
    cdPlayer:data1.cdPlayer,
    sunRoof:data1.sunRoof,
    leatherSeat:data1.leatherSeat,
    alloyWheels:data1.alloyWheels,
    powerSteering:data1.powerSteering,
    powerWindow:data1.powerWindow,
    ac:data1.ac,
    abs:data1.abs,
    airbag:data1.airbag,
    radio:data1.radio,
    cdChanger:data1.cdChanger,
    dvd:data1.dvd,
    tv:data.tv,
    powerSeat:data1.powerSeat,
    backTyre:data1.backTyre,
    grillGuard:data1.grillGuard,
    rearSpoiler:data1.rearSpoiler,
    centralLocking:data1.centralLocking,
    jack:data1.jack,
    spareTyre:data1.spareTyre,
    wheelSpanner:data1.wheelSpanner,
    fogLights:data1.fogLights,
    backCamera:data1.backCamera,
    pushStart:data1.pushStart,
    keylessEntry:data1.keylessEntry,
    esc:data1.esc,
    cameraDegree360:data1.cameraDegree360,
    bodyKit:data1.bodyKit,
    sideAirbag:data1.sideAirbag,
    powerMirror:data1.powerMirror,
    sideSkirts:data1.sideSkirts,
    frontLipSpoiler:data1.frontLipSpoiler,
    navigator:data1.navigator,
    turbo:data1.turbo,
    powerSlideDoor:data1.powerSlideDoor,
    Dated: new Date()
 }
var images = [];
for (let i = 0; i < req.files.length; i++) {
images.push(`${req.protocol}://${req.get('host')}/uploads/${req.files[i].filename}`);  
}

params.images = images;

setTimeout(() => {
  db.collection('myCarCollections').insertOne(params)
  .then((response)=>{
   if (response.acknowledged == true) {
    return res.status(200).send("record is successfully added....")
   }else{
     return res.status(404).send("record is not successfully added....")
   }
  })
  .catch((err)=> {
   return res.status(404).send(err);
 })
}, 1000);
})
app.post('/delete-product',(req,res)=>{
  const filter = { _id: req.body.id};
  db.collection('myCarCollections').find({_id:req.body.id}).toArray()
  .then((respose)=>{
  for (let i = 0; i < respose[0].images.length; i++) {
    var pathName = path.join(__dirname,'uploads',respose[0].images[i].split('/')[4])
    fs.unlink(pathName, (err) => {
      if (err) {
        console.error('Error deleting image:', err);
      }
  
      console.log({ message: 'Image deleted successfully' });
    });
  }
  })
  .catch((err)=>{
    return res.status(404).send(err);
  })
  setTimeout(() => {   
    db.collection('myCarCollections').deleteOne(filter)
    .then((response)=>res.status(200).send('successfully deleted....'))
    .catch((err)=> res.status(404).send(err))
  }, 1000);
})
app.post('/delete-order',(req,res)=>{
  pool.getConnection((err, connection) => {
    if(err) throw err
    connection.query('DELETE FROM aquaorder WHERE id = ?', [req.body.id], (err, rows) => {
        connection.release() 
        if (!err) {
          res.status(200).send('sucessfully deleted...')
        } else {
            console.log(err)
        }
    })
})

})
app.get('/products',(req,res)=>{

  db.collection('myCarCollections').find({}).toArray()
  .then((respose)=>{
    return res.status(200).send(respose);
  })
  .catch((err)=>{
    return res.status(404).send(err);
  })

})


app.get('/single-product/:id',(req,res)=>{

  db.collection("myCarCollections").findOne({_id:req.params.id})
  .then((response)=>res.status(200).send(response))
  .catch((err)=>res.status(404).send("There is an error occur during process..."))
})

app.post('/update-product',upload.array("files"),(req,res)=>{
const data = JSON.parse(req.body.data);
const data1 = JSON.parse(req.body.data1);

let params = {
  _id:req.body._id,
  M3 : data.M3,
  bodyType : data.bodyType,
  chassisNo : data.chassisNo,
  city : data.city,
  country : data.country,
  dimension : data.dimension,
  doors : data.doors,
  drive : data.drive,
  engineCode : data.engineCode,
  engineSize : data.engineSize,
  extColor : data.extColor,
  fuel : data.fuel,
  make : data.make,
  manufacture : data.manufacture,
  maxCapacity : data.maxCapacity,
  mileage : data.mileage,
  model : data.model,
  modelCode : data.modelCode,
  price : data.price,
  refNo : data.refNo,
  registration : data.registration,
  seats : data.seats,
  steering : data.steering,
  transmission : data.transmossion,
  vehicleName : data.vehicleName,
  version : data.version,
  weight : data.weight,
  images : [],
    cdPlayer:data1.cdPlayer,
    sunRoof:data1.sunRoof,
    leatherSeat:data1.leatherSeat,
    alloyWheels:data1.alloyWheels,
    powerSteering:data1.powerSteering,
    powerWindow:data1.powerWindow,
    ac:data1.ac,
    abs:data1.abs,
    airbag:data1.airbag,
    radio:data1.radio,
    cdChanger:data1.cdChanger,
    dvd:data1.dvd,
    tv:data.tv,
    powerSeat:data1.powerSeat,
    backTyre:data1.backTyre,
    grillGuard:data1.grillGuard,
    rearSpoiler:data1.rearSpoiler,
    centralLocking:data1.centralLocking,
    jack:data1.jack,
    spareTyre:data1.spareTyre,
    wheelSpanner:data1.wheelSpanner,
    fogLights:data1.fogLights,
    backCamera:data1.backCamera,
    pushStart:data1.pushStart,
    keylessEntry:data1.keylessEntry,
    esc:data1.esc,
    cameraDegree360:data1.cameraDegree360,
    bodyKit:data1.bodyKit,
    sideAirbag:data1.sideAirbag,
    powerMirror:data1.powerMirror,
    sideSkirts:data1.sideSkirts,
    frontLipSpoiler:data1.frontLipSpoiler,
    navigator:data1.navigator,
    turbo:data1.turbo,
    powerSlideDoor:data1.powerSlideDoor
 }
 var images = [];
 for (let i = 0; i < req.files.length; i++) {
  images.push(`${req.protocol}://${req.get('host')}/uploads/${req.files[i].filename}`)
 }
params.images = images;
setTimeout(() => {
  const filter = {_id:req.body._id};
  const update = {$set:params}
   db.collection('myCarCollections').updateOne(filter,update)
   .then((response)=>{
    if (response.acknowledged == true) {
     return res.status(200).send("record is updated successfully....")
    }else{
      return res.status(404).send("record is not updated successfully....")
    }
   })
   .catch((err)=> {
    return res.status(404).send(err);
  })
}, 1000);

})

app.post('/update-order',(req,res)=>{
  pool.getConnection((err, connection) => {
    if(err) throw err
    connection.query('UPDATE aquaorder SET firstName = "'+req.body.firstName+'", lastName = "'+req.body.lastName+'", country = "'+req.body.country+'", city = "'+req.body.city+'"  , zipCode = "'+req.body.zipCode+'" , streetAddress = "'+req.body.streetAddress+'" , contactnumber = "'+req.body.contactnumber+'" , email = "'+req.body.email+'" , orderNotes = "'+req.body.orderNotes+'"  , shippingType = "'+req.body.shippingType+'" , paymentMethod = "'+req.body.paymentMethod+'" , discount = "'+req.body.discount+'" , date = "'+Date.now()+'" , order = '+req.body.order+' WHERE id = "'+req.body.id+'"' , (err, rows) => {
        connection.release(); 
        if(!err) {
            res.send(true);
        } else {
            console.log(err);
        }
    })

})
})

app.post('/add-coupon',(req,res)=>{
const params ={
    id:uuidv4(),
    couponCode:req.body.couponCode,
    status:req.body.status
  }
  pool.getConnection((err, connection) => {
    if(err) throw err
    connection.query('INSERT INTO couponcodes SET ?', params, (err, rows) => {
    connection.release()
    if (!err) {
      res.status(200).send("successfully added.....");
    } else {
        console.log(err)
    }

    })
})
})
app.get('/get-coupons',(req,res)=>{
  pool.getConnection((err, connection) => {
    if(err) throw err
    connection.query('SELECT * from couponcodes', (err, rows) => {
        connection.release()
        if (!err) {
          res.status(200).send(rows)
        } else {
            console.log(err)
        }
    })
})
})
app.post('/delete-coupon',(req,res)=>{
  pool.getConnection((err, connection) => {
    if(err) throw err
    connection.query('DELETE FROM couponcodes WHERE id = ?', [req.body.id], (err, rows) => {
        connection.release() 
        if (!err) {
          res.status(200).send('sucessfully deleted...')
        } else {
            console.log(err)
        }
    })
})
})
app.post('/update-coupon',(req,res)=>{
  pool.getConnection((err, connection) => {
    if(err) throw err
    connection.query('UPDATE couponcodes SET couponCode = ?, status = ?  WHERE id = ?', [req.body.couponCode, req.body.status, req.body.id], (err, rows) => {
        connection.release(); 
        if(!err) {
            res.send(true);
        }else{
            console.log(err);
        }
    })
})
  })
app.get('/single-coupon/:id',(req,res)=>{
    pool.getConnection((err, connection) => {
      if(err) throw err
      connection.query('SELECT * FROM couponcodes WHERE id = ?', [req.params.id], (err, rows) => {
          connection.release() 
          if (!err) {
              res.status(200).send(rows[0]);
          } else {
              console.log(err);
          }
      })
  })
  
  })


  
  

app.post('/send-mail',(req,res)=>{

  pool.getConnection((err, connection) => {
    if(err) throw err
    connection.query('SELECT * FROM subscriptions WHERE email = ?', [req.body.email], (err, rows) => {
        connection.release() 
        if (!err) {
           if (rows.length != 0) {
            return res.status(200).send('email already subscribed...')
           }else{
            var transporter = nodemailer.createTransport({
              service:'gmail',
              secure:false,
              port: 25,
               auth: {
                   user: 'mineralwateraquabird@gmail.com',
                   pass: 'amweplxnjyblywdh'
               },
               tls: {
                   rejectUnauthorized: false
               }
           });
           
      
      let details={
        from:"mineralwateraquabird@gmail.com",
        to: req.body.email,
        subject:"subscription alert",
        text:"hi, thanks for subscribing aquabird.pk",
        html : `<div>Hi,<br> Thanks for subscribing aquabird.pk. Kindly activate your subscription using following
         button.<br><br>  <button style="background:blue;border:none;outline:none;box-shadow:none;
         width:30%;padding:1.5vw 0;border-radius:15px;font-size:18px;font-weight:bold;"><a style="color:white;text-decoration:none" href="http://localhost:3000/subscribe/${req.body.email}">Subscribe</a></button> 
         `
       }
         transporter.sendMail(details,(err)=>{
           if (err) {
             console.log(err);
           }else{
            const params ={
              id:uuidv4(),
              email:req.body.email,
              activate:false
            }
            pool.getConnection((err, connection) => {
              if(err) throw err
              connection.query('INSERT INTO subscriptions SET ?', params, (err, rows) => {
              connection.release()
              if (!err) {
                res.status(200).send("successfully added.....");
              } else {
                  console.log(err)
              }
          
              })
          })
           }
         })
          }
        } else {
            console.log(err);
        }
    })
})

})

app.get('/get-emails',(req,res)=>{
  pool.getConnection((err, connection) => {
    if(err) throw err
    connection.query('SELECT * from subscriptions', (err, rows) => {
        connection.release()
        if (!err) {
          res.status(200).send(rows)
        } else {
            console.log(err)
        }
    })
})
})

app.post('/activate-email',(req,res)=>{
  pool.getConnection((err, connection) => {
    if(err) throw err
    connection.query('SELECT * FROM subscriptions  WHERE email = ?', [req.body.email], (err, rows) => {
        connection.release(); 
        if(!err) {
          if (rows.length == 0) {
            return res.status(401).send('email is not found. kindly subscribe again on this email address.');
           }
           if (rows[0].email) {
            pool.getConnection((err, connection) => {
              if(err) throw err
              connection.query('UPDATE subscriptions SET activate = ?  WHERE email = ?', [true, req.body.email], (err, rows) => {
                  connection.release(); 
                  if(!err) {
                    return res.status(200).send('You have successfully subscribed....')
                  }else{
                      console.log(err);
                  }
              })
            })
           }
        }else{
            console.log(err);
        }
    })
  })
})


app.post('/contact',(req,res)=>{
  var transporter = nodemailer.createTransport({
    service:'gmail',
    secure:false,
    port: 25,
     auth: {
         user: 'mineralwateraquabird@gmail.com',
         pass: 'amweplxnjyblywdh'
     },
     tls: {
         rejectUnauthorized: false
     }
 });
 

let details={
from:"mineralwateraquabird@gmail.com",
to: "rmsik92@gmail.com",
subject:"message from client",
text:`Contact: ${req.body.contactNumber}  
Message: ${req.body.message}`,
}
transporter.sendMail(details,(err)=>{
 if (err) {
   console.log(err);
 }else{
res.status(200).send('Message have sent successfully.');
 }})
})
