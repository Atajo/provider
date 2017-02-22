//NPM
var compressor = require('node-minify');
var fs = require('fs-extra')
var path = require('path');
var crypto = require('crypto');
var sass = require('node-sass');
var spawn = require('child_process').spawn;
var cleanCSS = require('clean-css');

var diff = require('./atajo.diff');


var emptyDir = function(dirPath) {
    try {
        var files = fs.readdirSync(dirPath);
    } catch (e) {
        return;
    }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                emptyDir(filePath);
        }
};


var builder = {

    SOURCE_DIR: null,
    COMPILE_DIR: null,
    IS_WIN: false,
    INT: null,
    DELAY: null,
    IS_BUILDING: false,

    build: function(file, version, cb) {
        var _ = this;

        if (_.IS_BUILDING) {
            atajo.log.d("ALREADY BUILDING. WILL TRY AGAIN");
            if (_.DELAY) { clearTimeout(_.DELAY) };
            _.DELAY = setTimeout(function() { _.build(file, version, cb); }, 3000);
        }

        _.IS_BUILDING = true;


        if (typeof version.COREVERSION == 'undefined') {
            version.COREVERSION = false;
        }
        if (typeof version.CORELIB == 'undefined') {
            version.CORELIB = 'BASE';
        }
        if (typeof version.BASEVERSION == 'undefined') {
            version.BASEVERSION = '1.0';
        }
        if (typeof version.BASELIB == 'undefined') {
            version.BASELIB = 'MATERIAL';
        }


        _.SOURCE_DIR = path.join(__dirname, '../', '../', 'src', version.BASEVERSION);
        _.COMPILE_DIR = 'dist';
        _.COMPILE_PATH = path.join(__dirname, '../', '../', _.COMPILE_DIR, version.BASEVERSION);
        _.BUILD_PATH = path.join(__dirname, '../', 'build');
        _.PATCH_PATH = path.join(__dirname, '../', 'patch');


        fs.removeSync(_.COMPILE_PATH);
        fs.mkdirsSync(_.COMPILE_PATH);
        fs.copySync(_.SOURCE_DIR, _.COMPILE_PATH);

        _.buildCheck = {
            ts: false,
            scss: false,
            img: false,

        }

        if (file) {
            _.buildCheck.scss = file.match(/(.css|.scss)/) ? false : true;
            _.buildCheck.ts = file.match(/(.html|.ts)/) ? false : true;
            _.buildCheck.img = file.match(/(.png|.svg|.jpg)/) ? false : true;
        }



        builder.processTS(version).then(() => {
            builder.buildCheck.ts = true;

            builder.processCSS(version).then(() => {

                builder.buildCheck.scss = true;

                builder.processIMG(version).then(() => {
                    builder.buildCheck.img = true;

                }).catch((error) => { builder.buildCheck.img = 'ERROR : ' + error; });

            }).catch((error) => { builder.buildCheck.scss = 'ERROR : ' + error; });

        }).catch((error) => { builder.buildCheck.ts = 'ERROR : ' + error; });





        _.INT = setInterval(function() {

            var pass = true;
            for (var i in builder.buildCheck) {

                if (builder.buildCheck[i] == false) {
                    pass = false;
                } else if (_.buildCheck[i] && typeof _.buildCheck[i] == 'string' && _.buildCheck[i].indexOf('ERROR') > -1) {
                    atajo.log.e(_.buildCheck[i]);
                    builder.IS_BUILDING = false;
                    clearInterval(_.INT);
                    atajo.log.d("BUILD FAILED -> WONT UPLOAD");
                    cb(false);
                }
            }

            if (pass) {

                builder.IS_BUILDING = false;
                atajo.log.d("BUILD PASSED -> WILL UPLOAD");
                clearInterval(_.INT);
                cb(true);

            }


        }, 500);






    },

    processIMG: function(version) {

        var _ = this;
        return new Promise((resolve, reject) => {

            if (builder.buildCheck.img) {
                // return resolve();
            }


            var imgFiles = _.getFiles(_.COMPILE_PATH, ['jpg', 'png', 'svg'], false, false); //atajo.log.d("HTMLFILES --> "+JSON.stringify(htmlFiles));
            _.packageImageFiles(imgFiles, ['png', 'svg', 'jpg'], version.BASEVERSION, function(clear) {
                resolve();
            });


        });


    },

    processTS: function(version) {

        var _ = this;

        return new Promise((resolve, reject) => {

            if (builder.buildCheck.ts) {
                //  return resolve();
            }


            //POPULATE TEMPLATES
            atajo.log.i("BUILDING TEMPLATES");
            var TSFiles = _.getFiles(_.COMPILE_PATH, 'ts', '', false);
            var HTMLFiles = _.getFiles(_.COMPILE_PATH, 'html', '', false);

            //atajo.log.d("TS FILES ARE : "+JSON.stringify(TSFiles)); 
            for (var t in TSFiles) {
                var tsFile = TSFiles[t];
                var tsFileName = path.basename(tsFile);
                var tsContent = fs.readFileSync(tsFile, 'utf8');

                for (var h in HTMLFiles) {
                    var htmlFile = HTMLFiles[h];

                    //atajo.log.d("HTML FILE IS : " + htmlFile);

                    // var htmlPath = htmlFile.split(_.COMPILE_DIR + '/')[1];
                    var htmlPath = path.basename(htmlFile);

                    // htmlPath = htmlPath.replace(tsPathRemainder, '');

                    // atajo.log.d("HTML PATH IS : " + htmlPath);

                    if (tsContent.indexOf(htmlPath) > -1) {
                        // atajo.log.d("FOUND TEMPLATE MATCH FOR " + htmlPath + " IN " + tsFile);

                        var htmlContent = fs.readFileSync(htmlFile, 'utf8');
                        htmlContent = htmlContent.replace(/'/g, "\\'");
                        htmlContent = htmlContent.replace(/(\r\n|\n|\r)/gm, "");

                        var re = new RegExp("[^'|^" + '"' + "]*" + htmlPath, "g");
                        // var re = new RegExp(htmlPath, "g");

                        tsContent = tsContent.replace(re, htmlContent);
                        tsContent = tsContent.replace(/templateUrl/g, 'template');

                        fs.writeFileSync(tsFile, tsContent);
                        //   atajo.log.d("TSCONTENT IS NOW : " + tsContent);

                    }

                    // process.exit();

                }

            }

            //CREATE SHIM
            // _.generatePatch("<ion-app></ion-app>", path.join(_.BUILD_PATH, 'base-' + version.BASEVERSION + '.html'));

            fs.writeFileSync(path.join(_.BUILD_PATH, 'base-' + version.BASEVERSION + '.html'), "<ion-app></ion-app>");


            //BUILD TYPESCRIPT
            atajo.log.i("BUILDING TYPESCRIPT");

            fs.copySync(path.join(__dirname, '../', 'conf-internal', 'webpack.config.js'), path.join(_.COMPILE_PATH, 'webpack.config.js'));
            process.chdir(_.COMPILE_PATH);

            const webpack = spawn('webpack', []);

            webpack.on('error', function(err)
            {   
                if((err+"").indexOf('ENOENT') > -1)
                {
                    atajo.log.e("WEBPACK NOT FOUND - PLEASE INSTALL GLOBALLY BY RUNNING : npm install -g webpack");
                   /* const npm = spawn('npm', ['install', '-g', 'webpack']); 
                    npm.on('close', () => {

                         atajo.log.i("PLEASE RESTART PROVIDER");
                         process.exit();  

                    }); */ 
                    process.exit(1); 


                }
                

            });

            webpack.stdout.on('data', (data) => {
                atajo.log.d(`${data}`);
            });

            webpack.stderr.on('data', (data) => {
                atajo.log.e(`${data}`);
            });

            webpack.on('close', (code) => {

                if (code == 0) {
                    atajo.log.i("TYPESCRIPT DONE");
                    fs.copySync(path.join(_.COMPILE_PATH, 'bundle.js'), path.join(_.BUILD_PATH, 'base-' + version.BASEVERSION + '.js'));
                    // _.generatePatch(fs.readFileSync(path.join(_.COMPILE_PATH, 'bundle.js'), 'utf8'), path.join(_.BUILD_PATH, 'base-' + version.BASEVERSION + '.js'));

                    atajo.log.d("DONE BUILDING JS");
                    resolve();

                } else {
                    atajo.log.e("YOU HAVE ERRORS IN YOUR CODE. PLEASE FIX");
                    reject();

                }
            });






        })
    },


    processCSS: function(version) {

        var _ = this;

        return new Promise(function(resolve, reject) {

            if (builder.buildCheck.scss) {
                //  return resolve();
            }


            atajo.log.d("BUILDING (S)CSS");

            var cssBuildFile = path.join(_.BUILD_PATH, 'base-' + version.BASEVERSION + '.css');


            //DO SASS
            var SASSFiles = _.getFiles(_.COMPILE_PATH, 'scss', '', false);


            _.compileSass(SASSFiles, function(css) {

                var CSSFiles = _.getFiles(_.COMPILE_PATH, 'css', '', false);

                for (var i in CSSFiles) {

                    var file = CSSFiles[i];
                    var content = fs.readFileSync(file);
                    css += content + '\n\n';

                }

                if (css == '') { css = '.noDirectCSS {}'; }


                css = new cleanCSS({}).minify(css);

                atajo.log.d("CSS MINIFICATION STATS : ");
                console.log(css.stats);

                fs.writeFileSync(cssBuildFile, css.styles);
                //_.generatePatch(fs.readFileSync(path.join(_.COMPILE_PATH, 'bundle.js'), 'utf8'), path.join(_.BUILD_PATH, 'base-' + version.BASEVERSION + '.js'));


                atajo.log.d("CSS DONE");
                resolve();

            })


        });



    },



    hash: function(version) {
        var _ = this;


        if (typeof version.BASEVERSION == 'undefined') {
            version.BASEVERSION = '1.0';
        }

        //atajo.log.d("HASHING PACKAGE VERSION "+version.BASEVERSION);

        try {

            var baseDir = path.join(__dirname, '../', '../', 'src', version.BASEVERSION);
            var check = _.hashDir(baseDir);
            var hash = crypto.createHash('md5').update(check).digest("hex");
            return hash;


        } catch (e) {
            atajo.log.e("COULD NOT PROCESS " + baseDir + " [ " + e + " ]");
            return false;
        }



    },

    compileSass: function(files, cb) {

        // atajo.log.d("COMPILING SASS FILES : " + JSON.stringify(files));

        var scss = '';
        for (var f in files) {

            var file = files[f];

            var includePaths = [
                path.dirname(file),
                path.join(__dirname, '../', '../', 'lib', 'components'),
                path.join(__dirname, '../', '../', 'lib', 'themes'),
                path.join(__dirname, '../', '../', 'lib', 'fonts'),
            ];

            //atajo.log.d("SASS INCLUDE PATHS ARE : " + JSON.stringify(includePaths))

            var content = fs.readFileSync(file, 'utf8');
            // atajo.log.d("SASS CONTENT IS : " + content);
            var result = sass.renderSync({
                data: content,
                includePaths: includePaths
            });

            // atajo.log.d("SASS RESULT IS : ");
            // console.log(result);
            //atajo.log.d("SASS RESULT IS : " + result.css.toString());

            //  fs.appendFileSync(outFile, result.css.toString())
            scss += result.css.toString() + '\n\n';


        }

        cb(scss);



    },


    //DEPS
    getFiles: function(dir, ext, excludePrefix, addSemiColon) {
        var _ = this;

        var _files = [];
        var files;
        try {
            files = fs.readdirSync(dir);
        } catch (e) {
            atajo.log.d("DIRECTORY NOT FOUND " + dir);
            return [];

        }

        for (var i in files) {
            var file = files[i];
            var ref = path.join(dir, file);


            if (fs.statSync(ref).isDirectory()) {
                _files = _files.concat(_.getFiles(ref, ext, excludePrefix, addSemiColon)); //FP -> REMOVE _files =
            } else {
                if (file == '.DS_Store') {
                    continue;
                } else if (excludePrefix && file.indexOf('_' + excludePrefix) != -1) {
                    atajo.log.d("REJECTING FILE " + file + " DUE TO PREFIX _" + excludePrefix);
                    continue;
                } else if (excludePrefix == '_' && file.indexOf('_') > -1) {
                    atajo.log.d("REJECTING FILE " + file + " DUE TO PREFIX " + excludePrefix);
                    continue;
                }

                if (Object.prototype.toString.call(ext) === '[object Array]') {

                    var found = false;
                    for (var e in ext) {
                        var _ext = ext[e];
                        if (file.indexOf('.' + _ext) > -1) {
                            found = true
                        }

                    }
                    if (!found) {
                        continue;
                    }
                } else {

                    if (file.indexOf('.' + ext) == -1) {
                        continue;
                    }
                }


                //add ;; to the end of file...

                if (addSemiColon) {
                    var fileData = fs.readFileSync(ref, "utf8");
                    if (fileData.lastIndexOf(';;') < fileData.length - 5) {
                        fs.appendFileSync(ref, ';;', "utf8");
                    }
                }
                /*
                							var fileData = fs.readFileSync(ref, "utf8");
                							if(fileData.indexOf('<<<EOF>>>') === -1 )
                							{
                									fs.appendFileSync(ref, '<<<EOF>>>', "utf8");
                							}
                */


                _files.push(ref);


            }

        }




        return _files;


    },

    packageFiles: function(files, ext, type, vers, cb) {
        var _ = this;

        //	atajo.log.d("PACKAGING "+vers+" / "+ext+" / "+type);

        new compressor.minify({
            type: type,
            fileIn: files,
            fileOut: path.join(_.BUILD_PATH, '/base-' + vers + '.' + ext),
            callback: function(err, min) {
                //  atajo.log.d("DONE PACKAGING "+vers+" / "+ext+" / "+type);
                if (err) {
                    atajo.log.e("COULD NOT PACKAGE " + type.toUpperCase() + " (NOT UPLOADING TO CORE) : " + err);
                    cb(false);
                } else {
                    cb(true);
                }

            }
        });


    },

    packageImageFiles: function(files, ext, vers, cb) {
        var _ = this;



        var images = [];

        for (var i in files) {
            var img = files[i];


            var imgPath = path.relative(_.BASE_DIR, img);

            //atajo.log.d("PROCESSING ("+_.BASE_DIR+") - "+imgPath+" / "+img);


            var nam = path.basename(img);

            var valid = false;
            for (var e in ext) {
                if (nam.indexOf('.' + ext[e]) > -1) {
                    valid = ext[e];
                    break;
                }
            }

            if (!valid) {
                atajo.log.i('IMAGE ' + nam + ' NOT A VALID IMAGE. CONTINUING');
                continue;
            }

            img = fs.readFileSync(img);

            images.push({
                name: nam,
                data: new Buffer(img).toString('base64'),
                ext: valid,
                path: imgPath.replace(nam, '').replace(/\\/g, '/') //replace any windows style slashes '\\' with unix style slashes '/'
            });

            //console.log(images[nam]);  
        }

        fs.writeFileSync(path.join(_.BUILD_PATH, '/base-' + vers + '.img'), JSON.stringify(images));

        cb(true);


    },



    hashDir: function(dir) {
        var _ = this;

        //	atajo.log.d("HASHING DIR "+dir);
        var check = '';
        var files = fs.readdirSync(dir); //FP -> Remove var;

        for (var f in files) {
            file = files[f];

            if (file == '.DS_Store' || typeof file == 'undefined') {
                continue;
            }
            //atajo.log.d("FILE IS "+file);
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                check += _.hashDir(path.join(dir, file));
            } else {
                check += fs.readFileSync(path.join(dir, file));
            }
        }

        return check;



    },


    generatePatch: function(newFileContent, oldFile) {

        var _ = this;

        if (!fs.existsSync(oldFile)) {
            atajo.log.e("DESTINATION NOT FOUND -> CANNOT DIFF");
            fs.writeFileSync(oldFile, newFileContent);
            return;
        }

        var oldFileContent = fs.readFileSync(oldFile, 'utf8');

        if (oldFileContent == newFileContent) {
            atajo.log.d("DIFF : " + oldFile + " UNCHANGED -> NOT GENERATING PATCH");
            return;
        }


        atajo.log.d("GENERATING DIFF");

        // var patches = diffMatchPatch().diff_main(oldFileContent, newFileContent);
        // atajo.log.d("PATCHES ARE ");
        //  console.log(patches);
        // return;

        var patch = diff.getPatch(oldFileContent, newFileContent, 1000);

        atajo.log.d("THERE WHERE " + patch.mismatches + " MISMATCHES");
        //console.log(patch);



        //SAVE THE DIFF
        var files = fs.readdirSync(_.PATCH_PATH);
        var fileCount = 0;
        for (var f in files) {
            var file = files[f];
            if (file.indexOf(path.basename(oldFile)) > -1) {
                fileCount++;
            }
        }

        var patchFile = path.join(_.PATCH_PATH, path.basename(oldFile) + '.' + fileCount + '.patch');
        fs.writeFileSync(patchFile, JSON.stringify(patch));

        //REPLACE OLD WITH NEW
        fs.writeFileSync(oldFile, newFileContent);



    },






};


module.exports = builder;