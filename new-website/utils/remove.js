var glob = require('glob');
const fs = require('fs');

glob('./my-website/docs/articles/*.md', function (err, files) {
    if (err) {

        console.log(err);

    } else {

        console.log("hello");
        files.forEach(function (file) {

        fs.readFile(file, 'utf-8', function (err, data) {
              if (err) {
                  console.log(err);
              } else {
                var newValue = data.replace(/<!-- -->/gim, '');
                fs.writeFile(file, newValue, 'utf-8', function(err, data) {
                           console.log(file);
                            if (err) throw err;
                            console.log('Done!');
                          });
                }
        });
      });
        console.log(files);
    }
  });