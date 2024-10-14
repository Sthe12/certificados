//Para establecer metodos, rutas 
'use strict'
var express=require('express');
//var bodyParse=require('body-parser');
var app=express();
var authRoutes=require('./routes/authRoutes');
app.use(express.urlencoded({extended:false}));
app.use(express.json());
//cabeceras van a procesar los metodos y control de acceso HTTP
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, X-Request-With, Content-Type,Accept, Access-Control-Allow, Request-Method')
    res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,DELETE');
    res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
    res.header("Access-Control-Allow-Credentials",true);
    next();
});

//Rutas
app.use('/api/auth',authRoutes);
module.exports=app;