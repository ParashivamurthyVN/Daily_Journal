import express from "express";
import bodyParser from "body-parser";
import sql from "mssql";
// import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const port = 3000;
var config={
    server :"localhost\\SQLEXPRESS",
    database:"dairyapp",
    driver:"msnodesqlv8",
    user:"sa",
    password:"Thor!!8528",
    port:1433,
    options:{
     trustedConnection:true,
     trustServerCertificate: true
    }
  };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

const date = new Date();

const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
const day = String(date.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;

console.log(formattedDate); // Output will be in yyyy-mm-dd format


// const date= new Date()
 const today=date.getFullYear()+'-'+date.getMonth()+1+'-'+date.getDate()

console.log(date);


const getList = async () => {
    return new Promise((resolve, reject) => {
      sql.connect(config, async function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Connected to DB");
          var request = new sql.Request();
  
          try {
            const query = `select * from list;`;
            //  request.input('today', sql.NVarChar, formattedDate);
            const result = await request.query(query);
            console.log(result.recordset);
            resolve(result.recordset);
          } catch (error) {
            console.error("Error executing query", error.stack);
            reject(error);
          } finally {
            // Ensure to close the connection after the query is executed
            sql.close();
          }
        }
      });
    });
  };

//Adding notes
const addList = async (newItem) => {
  console.log(newItem.date+" "+newItem.content);
    return new Promise((resolve, reject) => {
      sql.connect(config, async function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Connected to DB");
          var request = new sql.Request();
  
          try {
            const query = `INSERT INTO list values (@content, @date);`;
            request.input('content', sql.NVarChar, newItem.content);
             request.input('date', sql.NVarChar, newItem.date);
  
            const result = await request.query(query);
            console.log("Record inserted successfully:", result);
            resolve();
          } catch (error) {
            console.error("Error executing query", error.stack);
            reject(error);
          } finally {
            // Ensure to close the connection after the query is executed
            sql.close();
          }
        }
      });
    });
  };

// delete notes
const deleteitem = async (item) => {
  console.log(item.id);
    return new Promise((resolve, reject) => {
      sql.connect(config, async function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          var request = new sql.Request();
  
          try {
            const query = `DELETE FROM list WHERE id =${item.id}`;
            // request.input('id', sql.NVarChar, item.id);
  
            const result = await request.query(query);
            console.log("Record deleted successfully:", result);
  
            resolve();
          } catch (error) {
            console.error("Error executing query", error.stack);
            reject(error);
          } finally {
            // Ensure to close the connection after the query is executed
            sql.close();
          }
        }
      });
    });
  };

//daysummary
//geting daysummary
const getDaySummary = async () => {
  return new Promise((resolve, reject) => {
    sql.connect(config, async function (err) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log("Connected to DB2");
        var request = new sql.Request();

        try {
          const query = `select * from daysummary where day=@today;`;
           request.input('today', sql.NVarChar, formattedDate);
          const result = await request.query(query);
          console.log(result.recordset);
          resolve(result.recordset);
          
        } catch (error) {
          console.error("Error executing query", error.stack);
          reject(error);
        } finally {
          // Ensure to close the connection after the query is executed
          sql.close();
        }
      }
    });
  });
};

//adding day summary 
const addDaySummary = async (newItem) => {
  console.log(newItem.content);
    return new Promise((resolve, reject) => {
      sql.connect(config, async function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Connected to DB");
          var request = new sql.Request();
  
          try {
            const query = `INSERT INTO daysummary values (@content, @date);`;
            request.input('content', sql.NVarChar, newItem.content);
              request.input('date', sql.NVarChar, formattedDate);
  
            const result = await request.query(query);
            console.log("Record inserted successfully:", result);
            resolve();
          } catch (error) {
            console.error("Error executing query", error.stack);
            reject(error);
          } finally {
            // Ensure to close the connection after the query is executed
            sql.close();
          }
        }
      });
    });
  };

  

app.get("/list", async (req, res) => {
    getList().then((data)=>{res.send(data);});
});

app.post("/list", async (req, res) => {
  console.log(req.body);
    addList(req.body).then(()=>{
        getList().then((data)=>{res.send(data);});
    });
});

app.delete("/list", async (req, res) => {
    deleteitem(req.body).then(()=>{
    getList().then((data)=>{res.send(data);});
  });
 });

// day summary 

app.get("/daysummary", async (req, res) => {
  getDaySummary().then((data)=>{res.send(data);});
});

app.post("/daysummary", async (req, res) => {
  console.log(req.body);
    addDaySummary(req.body).then(()=>{
      getDaySummary().then((data)=>{res.send(data);});
    });
});

// weather 


const getWeather = async () => {
  return new Promise((resolve, reject) => {
    try {
  const newData = fetch("https://api.openweathermap.org/data/2.5/weather?units=metric&q=bangalore&appid=8e0933963e58251f1f63eec0d9680dd7", {
      method: "GET",
      headers: {
          'content-type': 'application/json',
          'Accept': 'application/json'
      },
  }).then(res => res.json());
  resolve(newData);
}
catch(err){
  reject(err);
}
  });
}


// Call the function to fetch the temperature
app.get("/getweather", async (req, res) => {
  getWeather().then((data)=>{res.send(data);});
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });