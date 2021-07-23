var express = require('express');
var router = express.Router();
var moment = require('moment'); // require

module.exports = function (db) {
    router.get('/', function (req, res) {
      const url = req.url == "/" ? "/?page=1" : req.url;
      let sql2 = 'SELECT COUNT (*) as total FROM siswa;'
      let sql = 'SELECT * FROM siswa limit 3 offset 0;'
      const page = parseInt(req.query.page) || 1;
      const limitTab = 3
      let offset = (page - 1) * limitTab;
      let nama = req.query.nama;
      let umur = parseInt(req.query.umur);
      let tinggi = parseFloat(req.query.tinggi);
      let start = req.query.start;
      let end = req.query.end;
      let jomblo = req.query.jomblo;
      let params = [];

      if (page) {
        sql = `SELECT * FROM siswa limit ${limitTab} offset ${offset}`;
      }
      if (nama || umur || tinggi || start || end || jomblo) {
        params.push({ nama: nama, umur, tinggi, start, end, jomblo });
      }
      if (params.length) {
        sql = `SELECT * FROM siswa WHERE `;
        sql2 = `SELECT COUNT (*) as total FROM siswa WHERE`;

        let flag = 0;
        let limit = ` limit 3 offset ${offset}`;
        if (params[0].nama) {
          sql += ` nama like '%${params[0].nama}%' `;
          sql2 += ` nama like '%${params[0].nama}%' `;
          flag = 1;
        }
        if (params[0].umur) {
          if (flag == 1) {
            sql += ` AND`;
            sql2 += ` AND`;
          }
          sql += ` umur = ${params[0].umur} `;
          sql2 += ` umur = ${params[0].umur} `;
          flag = 1;
        }
        if (params[0].tinggi) {
          if (flag == 1) {
            sql += ` AND`;
            sql2 += ` AND`;
          }
          sql += ` tinggi = ${params[0].tinggi} `;
          sql2 += ` tinggi = ${params[0].tinggi} `;
          flag = 1;
        }
        if (params[0].start && params[0].end) {
          if (flag == 1) {
            sql += ` AND`;
            sql2 += ` AND`;
          }
          sql += ` ttl between '${params[0].start}' and '${params[0].end}' `;
          sql2 += ` ttl between '${params[0].start}' and '${params[0].end}' `;
          flag = 1;
        }
        if (params[0].jomblo) {
          if (flag == 1) {
            sql += ` AND`;
            sql2 += ` AND`;
          }
          sql += ` jomblo = '${params[0].jomblo}' `;
          sql2 += ` jomblo = '${params[0].jomblo}' `;
        }
        sql += ` ${limit}`;
      }

      db.query(sql2, [], (err, data) => {
        if (err) {
          throw err
        }

        let totalPage = data.rows[0].total;  

        let pages = Math.ceil(totalPage / limitTab)
        db.query(sql, [], (err, data) => {
          if (err) {
            throw err
          }
          res.render('../views/home/list', { data: data.rows, moment: moment, totalPage, page, pages, url, nama, umur, tinggi, start, end, jomblo })
        })
      })

    })
    

  router.get('/add', function (req, res, next) {
    res.render('../views/add');
  });

  router.post('/add', function (req, res) {
    let add = `insert into siswa(nama,umur,tinggi,ttl,jomblo) values('${req.body.nama}',${req.body.umur},${req.body.tinggi},'${req.body.ttl}',${req.body.jomblo})`
    db.query(add, (err) => {
      if (err) {
        throw err
      }
      res.redirect('/')
    })
  })

  router.get('/delete/:id', function (req, res) {
    let index = req.params.id
    let del = `delete from siswa where id = ${index}`
    console.log(del)
    db.query(del, (err) => {
      if (err) {
        throw err
      }
      res.redirect('/')
    })
  })

  router.get('/edit/:id', (req, res) => {
    let index = req.params.id;
    let sql = `SELECT * FROM siswa WHERE id = ${index};`
    db.query(sql, (err, data) => {
      if (err) {
        throw err
      }
      res.render('../views/edit', { data: data.rows[0] })
    })

  })
  router.post('/edit/:id', (req, res) => {
    let sql = `UPDATE siswa SET nama = '${req.body.nama}',umur = ${req.body.umur},tinggi = ${req.body.tinggi},ttl = '${req.body.ttl}',jomblo = ${req.body.jomblo} WHERE id = ${req.params.id};`
    db.query(sql, (err) => {
      if (err) {
        throw err
      }
    });
    res.redirect('/')
  })


  return router;
}