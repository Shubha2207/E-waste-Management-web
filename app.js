var express = require("express");
var app = express();
var bodyParser = require("body-parser");

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Ewaste",{useNewUrlParser:true});

var MongoClient = require("mongodb").MongoClient;
MongoClient.connect("mongodb://localhost:27017/Ewaste", {useNewUrlParser:true},{ useUnifiedTopology: true });

var ip= "127.0.0.1";
var port = 3000;

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use( express.static("public"));

//SCHEMA SETUP
var employeeSchema = new mongoose.Schema({
    username : String,
    password : String ,
    applicant : String,
    email : String
});
var Employee = mongoose.model("Employee",employeeSchema);

var itemSchema = new mongoose.Schema({
    type : String,
    email : String,
    image : String,
    quantity : Number,
    price : String,
    info : String,
    sold : Boolean
});
var Item = mongoose.model("Item",itemSchema);

var paymentSchema = new mongoose.Schema({
    item_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Item"
    } ,
    employee_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Employee"
    },
    cardHolder : String,
    email : String,
    cardNo : String,
    created: {type:Date, default:Date.now} 
});
var Payment = mongoose.model("Payment",paymentSchema);


// Item.create({type:"Mobile",email:"shubha.pawar@gmail.com",image:"https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRxEJr2a5TXPDeWGOAg6JxbzU6tiKGzW1YoMP-C-V4XKhXgxsew",quantity:1,price:"150$",info:"Lenovo vibe k5 note"},function(err,newItem){
//     if(err)console.log(err);
// });

// Employee.create({
//     username:"Shubham", 
//     password:"Shubham@123", 
//     applicant:"Admin"
// },function(err,employee){
//     if(err){
//         console.log(err);
//     }else{
//         console.log(employee);
//     }
// });


app.get("/",function(req,res){
    //res.redirect("/members");
    res.render("base");
});

app.get("/employees/new",function(req,res){
    res.render("login");
});

app.get("/myAccount/:id",function(req,res){
    Employee.findById(req.params.id,function(err,employee){
        if(err){
            console.log(err);
        }else{
            if(employee.applicant == "Customer"){
                Item.find({},function(err,items){
                    if(err){
                        console.log(err);
                    }else{
                        res.render("customer.ejs",{employee:employee,items:items});
                    }
                }); 
            }else{
                Item.find({},function(err,items){
                    if(err){
                        console.log(err);
                    }else{
                        res.render("admin.ejs",{employee:employee,items:items});
                    }
                }); 
            }
        }
    });
});

app.post("/validate",function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var applicant = req.body.applicant;
    // var employee = {username:username,password:password,applicant:applicant};
    var flag = false;
    Employee.find({},function(err,employees){
        if(err){
            console.log(err);
        }else{
            employees.forEach(function(employee){
                if(employee.username==username && employee.password == password && employee.applicant == applicant){
                    if(applicant=="Customer"){
                        Item.find({},function(err,items){
                            if(err){
                                console.log(err);
                            }else{
                                res.render("customer.ejs",{employee:employee,items:items});
                            }
                        }); 
                    }else{
                        Item.find({},function(err,items){
                            if(err){
                                console.log(err);
                            }else{
                                res.render("admin.ejs",{employee:employee,items:items});
                            }
                        });    
                    }
                    flag = true;
                }
            })
            if(flag==false){
                //alert("Invalid User");
                //console.log("invalid user!");
                var error_msg = "User Not Found";

                res.render("error",{error_msg:error_msg});
            }
            
        }
    });
});



app.get("/reg",function(req,res){
    //res.redirect("/members");
    res.render("registration");
});

// app.get("/employees",function(req,res){
//     //res.render("members",{members:members});
//     Employee.find({},function(err,employees){
//         if(err){
//             console.log(err);
//         }else{
//             res.render("employees",{employees:employees});
//         }
//     });
// });

app.post("/employees",function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    var applicant = req.body.applicant;
    var email = req.body.email;
    var newEmployee = {username:username,password:password, applicant:applicant,email:email};
    var error_msg = "";
    var add = true ;
    Employee.find({},function(err,employees){
        if(err){
            console.log(err);
        }else{
            employees.forEach(function(employee){
                if(employee.username==newEmployee.username){
                    error_msg += "Username Already Exists.\n";
                    add = false;
                }
            })
        }
    });

    if(password == confirm_password && username.length>=8 && password.length >= 8 && add && email.length >= 8){
        Employee.create(newEmployee,function(err,newEmployee){
            if(err){
                console.log(err);
            }
        });
        res.redirect("/"); 
    }else{
        //alert("Password Doesn't match !");
        //console.log("can't add!");
        if(username.length < 8 || password.length < 8) error_msg += "Username/Password should contain atleast 8 characters.\n";
        if(password!=confirm_password) error_msg += "Password and Confirm-Password are not same.\n";
        res.render("error",{error_msg:error_msg});
    }
    
    
});

app.get("/employees/new",function(req,res){
    res.render("login");
});


app.get("/mobiles/:id",function(req,res){
    Item.find({},function(err,items){
        if(err){
            console.log(err);
        }else{
           
            Employee.findById(req.params.id,function(err,employee){
                if(err){
                    console.log(err);
                }else{
                    res.render("show_mobile",{employee:employee,items:items});
                }
            });
        }
    });
});


app.get("/laptops/:id",function(req,res){
    Item.find({},function(err,items){
        if(err){
            console.log(err);
        }else{
            
            Employee.findById(req.params.id,function(err,employee){
                if(err){
                    console.log(err);
                }else{
                    res.render("show_laptop",{employee:employee,items:items});
                }
            });
        }
    });
});
app.get("/others/:id",function(req,res){
    Item.find({},function(err,items){
        if(err){
            console.log(err);
        }else{
            
            Employee.findById(req.params.id,function(err,employee){
                if(err){
                    console.log(err);
                }else{
                    res.render("show_others",{employee:employee,items:items});
                }
            });
        }
    });
});



app.get("/items",function(req,res){
    res.redirect("/");
});



app.get("/items/new/:id",function(req,res){
    
    Employee.findById(req.params.id,function(err,employee){
        if(err){
            console.log(err);
        }else{
            res.render("add_items.ejs",{employee:employee});
        }
    });
});

app.get("/items/:id",function(req,res){
    var id = req.params.id;
    var index = id.indexOf('_');
    var item_id = id.substring(0,index);
    var employee_id = id.substring(index+1);
    Item.findById(item_id,function(err,foundItem){
        if(err){
            console.log(err);
        }else{
            Employee.findById(employee_id,function(err,employee){
                if(err){
                    console.log(err);
                }else{
                    res.render("show",{employee:employee,foundItem:foundItem});
                }
            });
        }
    });
});



app.post("/items/:id",function(req,res){
    var type = req.body.type;
    var email = req.body.email;
    var image = req.body.image;
    var quantity = req.body.quantity;
    var price = req.body.price;
    var info = req.body.info;
    var sold = false ;
    var newItem = {type:type,email:email,image:image,quantity:quantity,price:price,info:info, sold:sold};
    Item.create(newItem,function(err,newItem){
        if(err){
            console.log(err);
        }
    });
    res.redirect("/items/new/"+req.params.id);
});


// app.get("/showAdmin",function(req,res){
//     Item.find({},function(err,items){
//         if(err){
//             console.log(err);
//         }else{
//             res.render("admin",{items:items});
//         }
//     });
// });

app.get("/myItems/:id",function(req,res){
    Employee.findById(req.params.id,function(err,employee){
        if(err){
            console.log(err);
        }else{
            Item.find({},function(err,items){
                if(err){
                    console.log(err);
                }else{
                    res.render("item_list",{employee:employee,items:items});
                }
            });
        }
    });

});


//EDIT ROUTE
app.get("/items/:id/edit",function(req,res){
    //res.render("edit");
    Item.findById(req.params.id,function(err,foundItem){
        if(err){
            console.log(err);
        }else{
            res.render("edit",{foundItem:foundItem});
        }
    });
});

//UPDATE ROUTE

app.post("/updateItem/:id",function(req,res){
    Item.findByIdAndUpdate(req.params.id,req.body.item,function(err,item){
        if(err){
            console.log(err);
        }else{
            Employee.find({},function(err,employees){
                if(err){
                    console.log(err);
                }else{
                    employees.forEach(function(employee){
                        if(employee.email==item.email){
                            res.redirect("/myItems/"+employee.id);
                        }
                    })
                }
            });
        }
    });
});



app.get("/deleteItem/:id",function(req,res){
    var id = req.params.id;
    var index = id.indexOf('_');
    var item_id = id.substring(0,index);
    var employee_id = id.substring(index+1);
    Item.findByIdAndRemove(item_id,function(err){
        if(err){
            console.log(err);
        }else{
            // res.redirect("/myAccount/"+req.params.Employeeid);
            res.redirect("/myAccount/"+employee_id);
        }
    });
});

app.get("/deleteItemFromItemList/:id",function(req,res){
    var id = req.params.id;
    var index = id.indexOf('_');
    var item_id = id.substring(0,index);
    var employee_id = id.substring(index+1);
    Employee.findById(employee_id,function(err,employee){
        
        Item.findByIdAndRemove(item_id,function(err){
            if(err){
                console.log(err);
            }else{
                Item.find({},function(err,items){
                    if(err){
                        console.log(err);
                    }else{
                        res.render("item_list",{employee:employee,items:items});
                    }
                });
            }
        });
    });
});

//this route is used for admin to show all payments
app.get("/payments",function(req,res){
    Payment.find({},function(err,payments){
        if(err){
            console.log(err);
        }else{
            res.render("show_payment.ejs",{payments:payments});
        }
    });
});


//used by customer when he buys a item
app.get("/payments/:id",function(req,res){
    var id = req.params.id;
    var index = id.indexOf('_');
    var item_id = id.substring(0,index);
    var employee_id = id.substring(index+1);
    
    var newPayment = {item_id:item_id, employee_id:employee_id};
    Payment.create(newPayment,function(err,newPayment){
        if(err){
            console.log(err);
        }else{
            Item.findByIdAndUpdate(item_id,{sold:true},function(err){
                if(err){
                    console.log(err);
                }else{
                    res.render("payment.ejs",{newPayment:newPayment});
                }
            });
        }
    });
});


//payment details are updated in the payment
app.post("/payments/:id",function(req,res){
        var cardHolder = req.body.cardHolder;
        var email = req.body.email;
        var cardNo = req.body.cardNo;
        var newPayment = {cardHolder:cardHolder,email:email,cardNo:cardNo};
        Payment.findByIdAndUpdate(req.params.id,newPayment,function(err,payment){
            if(err){
                console.log(err);
            }else{
                res.render("done_payment.ejs",{payment:payment});
            }
        });
});

app.get("/show_payment/:id",function(req,res){
    Payment.findById(req.params.id,function(err,payment){
        if(err){
            console.log(err);
        }else{
            Item.findById(payment.item_id,function(err,item){
                if(err){
                    console.log(err);
                }else{
                    res.render("show_payment_details.ejs",{payment:payment,item:item});
                }
            });
            
        }
    });
});

app.get("/reports",function(req,res){
    Payment.find({},function(err,payments){
        if(err){
            console.log(err);
        }else{
            Item.find({},function(err,items){
                if(err){
                    console.log(err);
                }else{
                    res.render("report.ejs",{payments:payments,items:items});
                }
            });
            
        }
    });
});

app.listen(port,ip,function(){
    console.log("Server has started !");
});