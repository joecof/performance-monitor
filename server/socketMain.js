const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/perfData', {
  useNewUrlParser: true
})
const Machine = require('./models/Machine');

function socketMain(io, socket) {
  let macA;

  socket.on('clientAuth', (key) => {
    if(key === '123ioj1o23j1l'){
      socket.join('clients');
    } else if(key === 'alksjd1231') {
      socket.join('ui');
      console.log('client joined')
      Machine.find({}, (err, docs) => {
        docs.forEach((aMachine) => {
          aMachine.isActive = false;
          io.to('ui').emit('data', aMachine);
        })
      })
    } else {
      socket.disconnect(true);
    }
  })

  socket.on('disconnect', () => {
    Machine.find({macA: macA}, (err, docs) => {
      if(docs.length > 0) {
        docs[0].isActive = false;
        io.to('ui').emit('data', docs[0])
      }
    })
  })

  socket.on('initPerfData', async (data) => {
    macA = data.macA;
    const mongooseResponse = await checkAndAdd(data);
    console.log(mongooseResponse);
  })

  socket.on('perfData', (data) => {
    // console.log('Tick...');
    console.log(data);
    io.to('ui').emit('data', data);
  });
}

function checkAndAdd(data) {
  return new Promise ((resolve, reject) => {
    Machine.findOne({
      macA: data.macA
    },
      (err, doc) => {
        if(err) {
          throw err;
          reject(err);
        } else if(doc === null) {
          let newMachine = new Machine(data);
          newMachine.save();
          resolve('added');
        } else {
          resolve('found');
        }
      } 
    )
  })
}

module.exports = socketMain;