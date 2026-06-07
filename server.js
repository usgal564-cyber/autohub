require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'autohub_secret_2024';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

let USERS = [
  { id: 1, name: "Батбаяр Дорж", email: "bat@example.com", password: bcrypt.hashSync("password123", 10), phone: "99112233", address: "УБ, Сүхбаатар дүүрэг, 3-р хороо", facebook: "facebook.com/batbayar", avatar: "", bio: "Автомашины чиглэлээр 10 жил ажиллаж байна.", joinedAt: "2023-01-15" }
];

let VEHICLES = [
  { id:1,sellerId:1,title:"Toyota RAV4 2019",category:"mashin",brand:"Toyota",model:"RAV4",color:"ulaan",colorMn:"улаан",price:45000000,year:2019,km:68000,fuel:"Бензин",condition:"Маш сайн",description:"Маш сайн байдалтай, осолгүй, нэг эзэнтэй.",img:"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800",img2:"https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=800"},
  { id:2,sellerId:1,title:"Toyota Prius 30",category:"mashin",brand:"Toyota",model:"Prius",color:"tsagaan",colorMn:"цагаан",price:18500000,year:2012,km:145000,fuel:"Гибрид",condition:"Сайн",description:"100км-д 4.5л хэрэглэнэ. Эдийн засагт хэмнэлттэй.",img:"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:3,sellerId:1,title:"Lexus RX 350 2020",category:"mashin",brand:"Lexus",model:"RX350",color:"har",colorMn:"хар",price:72000000,year:2020,km:42000,fuel:"Бензин",condition:"Шинэ",description:"Luxury SUV, бүрэн тоноглогдсон. Mark Levinson аудио.",img:"https://images.unsplash.com/photo-1621007947382-cc34a36466fe?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:4,sellerId:1,title:"BMW X5 2018",category:"mashin",brand:"BMW",model:"X5",color:"mungun",colorMn:"мөнгөн",price:89000000,year:2018,km:55000,fuel:"Бензин",condition:"Маш сайн",description:"xDrive 40i, M спорт багц. Panorama дээвэр.",img:"https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:5,sellerId:1,title:"Honda CRV 2021",category:"mashin",brand:"Honda",model:"CRV",color:"tsagaan",colorMn:"цагаан",price:52000000,year:2021,km:35000,fuel:"Гибрид",condition:"Маш сайн",description:"Sensing багц, Honda Connect навигаци.",img:"https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:6,sellerId:1,title:"Mercedes GLC 2020",category:"mashin",brand:"Mercedes",model:"GLC",color:"har",colorMn:"хар",price:95000000,year:2020,km:48000,fuel:"Бензин",condition:"Маш сайн",description:"AMG Line, Burmester аудио, Night Package.",img:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:7,sellerId:1,title:"Hyundai Tucson 2022",category:"mashin",brand:"Hyundai",model:"Tucson",color:"tsenher",colorMn:"цэнхэр",price:48000000,year:2022,km:22000,fuel:"Бензин",condition:"Шинэ",description:"N-Line дизайн, SmartSense аюулгүйн систем.",img:"https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:8,sellerId:1,title:"Giant Escape 3 2023",category:"undag_dugui",brand:"Giant",model:"Escape 3",color:"har",colorMn:"хар",price:1200000,year:2023,km:0,fuel:"-",condition:"Шинэ",description:"Aluminum хүрээ, Shimano хурдны хайрцаг.",img:"https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:9,sellerId:1,title:"Trek FX 3 Disc 2022",category:"undag_dugui",brand:"Trek",model:"FX3",color:"tsenher",colorMn:"цэнхэр",price:1850000,year:2022,km:500,fuel:"-",condition:"Маш сайн",description:"Disc тормоз, хот болон замын дугуйд тохиромжтой.",img:"https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:10,sellerId:1,title:"Xiaomi Scooter Pro 2",category:"scooter",brand:"Xiaomi",model:"Pro 2",color:"har",colorMn:"хар",price:1600000,year:2022,km:1200,fuel:"Цахилгаан",condition:"Сайн",description:"45км/ц хурд, 45км зайны нөөц.",img:"https://images.unsplash.com/photo-1597237154674-1a0d5274cef4?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:11,sellerId:1,title:"Ninebot Max G30 2023",category:"scooter",brand:"Ninebot",model:"Max G30",color:"har",colorMn:"хар",price:2100000,year:2023,km:300,fuel:"Цахилгаан",condition:"Шинэ",description:"65км нөөц, пневматик дугуй, LED дэлгэц.",img:"https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:12,sellerId:1,title:"Super Soco TC Max 2021",category:"tsahilgaan_bike",brand:"Super Soco",model:"TC Max",color:"har",colorMn:"хар",price:8500000,year:2021,km:8000,fuel:"Цахилгаан",condition:"Сайн",description:"120км нөөц, хамгийн дээд хурд 100км/ц.",img:"https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800",img2:""},
  { id:13,sellerId:1,title:"Yamaha Vino 125 2015",category:"moped",brand:"Yamaha",model:"Vino",color:"tsenher",colorMn:"цэнхэр",price:2300000,year:2015,km:22000,fuel:"Бензин",condition:"Дунд",description:"125cc хөдөлгүүр, эм хүний мопедэнд тохиромжтой.",img:"https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800",img2:""},
];

let nextVehicleId = 20;
let nextUserId = 2;

const BRAND_MODELS = {
  mashin:{Toyota:["Camry","Corolla","RAV4","Prius","Land Cruiser","Fortuner","Hilux","Venza","C-HR","Yaris"],Lexus:["RX350","RX450h","LX570","GX460","IS300","ES300h","NX300"],BMW:["X5","X3","X1","3 Series","5 Series","7 Series","X7","M3","M5"],Mercedes:["GLC","GLE","C-Class","E-Class","S-Class","GLS","A-Class","AMG GT"],Honda:["CRV","Civic","Accord","HR-V","Pilot","Odyssey","Fit"],Hyundai:["Tucson","Santa Fe","Sonata","Elantra","Kona","Palisade","Ioniq"],Kia:["Sportage","Sorento","K5","Carnival","Telluride","Stinger","EV6"],Nissan:["X-Trail","Qashqai","Patrol","Murano","Altima","Leaf"],Mazda:["CX-5","CX-30","Mazda3","Mazda6","CX-9"],Subaru:["Forester","Outback","Impreza","Crosstrek","Legacy","WRX"],Mitsubishi:["Outlander","Eclipse Cross","Pajero","L200","ASX"],Volkswagen:["Tiguan","Golf","Passat","Touareg","Polo"],Audi:["Q5","Q7","A4","A6","Q3","A3","Q8"],Ford:["Explorer","F-150","Mustang","Edge","Bronco","Ranger"],Chevrolet:["Tahoe","Suburban","Silverado","Equinox"],Porsche:["Cayenne","Macan","911","Panamera","Taycan"],"Land Rover":["Range Rover","Defender","Discovery","Evoque"],Jeep:["Wrangler","Grand Cherokee","Cherokee","Gladiator"],Volvo:["XC90","XC60","XC40","V90","S90"]},
  undag_dugui:{Giant:["Escape 3","Talon","ATX","Contend","Trance"],Trek:["FX3","Marlin","Domane","Emonda","Checkpoint"],Specialized:["Rockhopper","Sirrus","Diverge","Stumpjumper"],Cannondale:["Trail","Quick","SuperSix","Topstone"],Scott:["Aspect","Sportster","Addict","Spark"],Merida:["Big Nine","Matts","Scultura","Crossway"]},
  scooter:{Xiaomi:["Pro 2","Pro","Essential","3","4","4 Pro"],Ninebot:["Max G30","F40","E45","D28","Max G2"],Segway:["Ninebot E2","Ninebot E22","Ninebot F2"],Kugoo:["S1 Pro","G2 Pro","M4 Pro"]},
  tsahilgaan_bike:{"Super Soco":["TC Max","TC","CUX","CPX","TS"],Niu:["NQi GT","MQi GT","UQi GT","RQi"],Zero:["SR/F","SR/S","FX","FXE","DSR"]},
  moped:{Yamaha:["Vino","Jog","Gear","Zuma","BW's"],Honda:["Dio","Giorno","Zoomer","Beat","Activa"],Suzuki:["Address","Lets","Bistro"],Kawasaki:["Z125","KLX150","W175"]},
};

function authMiddleware(req,res,next){
  const token=req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({success:false,message:'Нэвтрэх шаардлагатай'});
  try{req.user=jwt.verify(token,JWT_SECRET);next();}
  catch{res.status(401).json({success:false,message:'Token хүчингүй'});}
}

app.post('/api/auth/register',async(req,res)=>{
  const{name,email,password,phone}=req.body;
  if(!name||!email||!password) return res.status(400).json({success:false,message:'Бүх талбарыг бөглөнө үү'});
  if(USERS.find(u=>u.email===email)) return res.status(400).json({success:false,message:'Имэйл бүртгэлтэй байна'});
  const hashed=await bcrypt.hash(password,10);
  const user={id:nextUserId++,name,email,password:hashed,phone:phone||'',address:'',facebook:'',avatar:'',bio:'',joinedAt:new Date().toISOString().split('T')[0]};
  USERS.push(user);
  const token=jwt.sign({id:user.id,email:user.email},JWT_SECRET,{expiresIn:'7d'});
  const{password:_,...safe}=user;
  res.json({success:true,token,user:safe});
});

app.post('/api/auth/login',async(req,res)=>{
  const{email,password}=req.body;
  const user=USERS.find(u=>u.email===email);
  if(!user||!(await bcrypt.compare(password,user.password))) return res.status(400).json({success:false,message:'Имэйл эсвэл нууц үг буруу'});
  const token=jwt.sign({id:user.id,email:user.email},JWT_SECRET,{expiresIn:'7d'});
  const{password:_,...safe}=user;
  res.json({success:true,token,user:safe});
});

app.get('/api/auth/me',authMiddleware,(req,res)=>{
  const user=USERS.find(u=>u.id===req.user.id);
  if(!user) return res.status(404).json({success:false});
  const{password:_,...safe}=user;
  res.json({success:true,user:safe});
});

app.put('/api/auth/profile',authMiddleware,(req,res)=>{
  const idx=USERS.findIndex(u=>u.id===req.user.id);
  if(idx===-1) return res.status(404).json({success:false});
  const{name,phone,address,facebook,bio,avatar}=req.body;
  USERS[idx]={...USERS[idx],name:name||USERS[idx].name,phone:phone??USERS[idx].phone,address:address??USERS[idx].address,facebook:facebook??USERS[idx].facebook,bio:bio??USERS[idx].bio,avatar:avatar??USERS[idx].avatar};
  const{password:_,...safe}=USERS[idx];
  res.json({success:true,user:safe});
});

app.get('/api/brands/:category',(req,res)=>{
  const brands=BRAND_MODELS[req.params.category];
  if(!brands) return res.status(404).json({success:false});
  res.json({success:true,brands:Object.keys(brands)});
});

app.get('/api/models/:category/:brand',(req,res)=>{
  const{category,brand}=req.params;
  const models=BRAND_MODELS[category]?.[decodeURIComponent(brand)];
  if(!models) return res.status(404).json({success:false});
  res.json({success:true,models});
});

app.get('/api/vehicles',(req,res)=>{
  const{category,search,minPrice,maxPrice,minYear,maxYear,brand,model,sellerId}=req.query;
  let results=[...VEHICLES];
  if(category&&category!=='all') results=results.filter(v=>v.category===category);
  if(brand) results=results.filter(v=>v.brand.toLowerCase()===brand.toLowerCase());
  if(model) results=results.filter(v=>v.model.toLowerCase()===model.toLowerCase());
  if(sellerId) results=results.filter(v=>v.sellerId===parseInt(sellerId));
  if(search){const q=search.toLowerCase();results=results.filter(v=>v.title.toLowerCase().includes(q)||v.brand.toLowerCase().includes(q)||v.model.toLowerCase().includes(q)||(v.colorMn&&v.colorMn.includes(q)));}
  if(minPrice) results=results.filter(v=>v.price>=parseInt(minPrice));
  if(maxPrice) results=results.filter(v=>v.price<=parseInt(maxPrice));
  if(minYear) results=results.filter(v=>v.year>=parseInt(minYear));
  if(maxYear) results=results.filter(v=>v.year<=parseInt(maxYear));
  const enriched=results.map(v=>{const seller=USERS.find(u=>u.id===v.sellerId);const{password:_,...safe}=seller||{};return{...v,seller:safe};});
  res.json({success:true,count:enriched.length,data:enriched});
});

app.get('/api/vehicles/:id',(req,res)=>{
  const v=VEHICLES.find(v=>v.id===parseInt(req.params.id));
  if(!v) return res.status(404).json({success:false});
  const seller=USERS.find(u=>u.id===v.sellerId);
  const{password:_,...safe}=seller||{};
  res.json({success:true,data:{...v,seller:safe}});
});

app.post('/api/vehicles',authMiddleware,(req,res)=>{
  const{title,category,brand,model,color,colorMn,price,year,km,fuel,condition,description,img}=req.body;
  if(!title||!category||!brand||!price) return res.status(400).json({success:false,message:'Шаардлагатай талбарыг бөглөнө үү'});
  const v={id:nextVehicleId++,sellerId:req.user.id,title,category,brand,model:model||'',color:color||'',colorMn:colorMn||'',price:parseInt(price),year:parseInt(year)||new Date().getFullYear(),km:parseInt(km)||0,fuel:fuel||'Бензин',condition:condition||'Сайн',description:description||'',img:img||'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',img2:'',createdAt:new Date().toISOString()};
  VEHICLES.push(v);
  res.json({success:true,data:v});
});

app.delete('/api/vehicles/:id',authMiddleware,(req,res)=>{
  const idx=VEHICLES.findIndex(v=>v.id===parseInt(req.params.id)&&v.sellerId===req.user.id);
  if(idx===-1) return res.status(404).json({success:false});
  VEHICLES.splice(idx,1);
  res.json({success:true});
});

app.post('/api/ai-search',async(req,res)=>{
  const{message,history}=req.body;
  if(!message) return res.status(400).json({success:false,message:'Хоосон хайлт'});
  const ctx=JSON.stringify(VEHICLES.map(v=>({id:v.id,title:v.title,brand:v.brand,model:v.model,category:v.category,color:v.color,colorMn:v.colorMn,price:v.price,year:v.year,km:v.km,fuel:v.fuel,condition:v.condition})));
  const sys=`Та AUTOHUB AI туслах. Монгол болон латин үсгийн монгол ойлго. Үнэ, жил, өнгө, брэнд, категориор шүүж чадна.
DATABASE:${ctx}
Хариу JSON: {"reply":"монгол текст","matchedIds":[1,2],"filterApplied":"тайлбар"} ЗӨВХӨН JSON.`;
  try{
    const msgs=(history||[]).slice(-6).map(h=>({role:h.role,content:h.content}));
    msgs.push({role:'user',content:message});
    const resp=await anthropic.messages.create({model:'claude-sonnet-4-20250514',max_tokens:1000,system:sys,messages:msgs});
    const raw=resp.content[0].text;
    let parsed;
    try{parsed=JSON.parse(raw.replace(/```json|```/g,'').trim());}
    catch{parsed={reply:raw,matchedIds:[],filterApplied:''};}
    const matched=(parsed.matchedIds||[]).length>0?VEHICLES.filter(v=>parsed.matchedIds.includes(v.id)):[];
    res.json({success:true,reply:parsed.reply,matchedIds:parsed.matchedIds||[],matchedVehicles:matched,filterApplied:parsed.filterApplied||''});
  }catch(e){res.status(500).json({success:false,message:'AI алдаа: '+e.message});}
});

app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

app.listen(PORT,()=>console.log(`🚀 AUTOHUB v2 → http://localhost:${PORT}`));
