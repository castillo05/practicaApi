import express from 'express';
import userRoute from './routes/user';

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use('/api', userRoute);

app.use('/',(req, res)=>{
    res.status(200).json({message:'Bienvenido Radexheaven'})
})



module.exports=app