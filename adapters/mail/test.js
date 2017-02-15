var mailer = require('./mailer');

var options = { "from": "kmsapdf@kmsa.com", "to": "Werner.venter@britehouse.co.za", "bcc": "werner.venter@britehouse.co.za;tsapdf@kmsa.com;werner.venter@britehouse.co.za;werner.venter@britehouse.co.za", "subject": "000011476594", "html": "<b>Konica Minolta Service Order 000011476594</b>", "attachments": [{ "filename": "000011476594.pdf", "path": "/data/QAS/Atajo-FieldServices/app/cache/pdfDirectory/000011476594.pdf", "contentType": "application/pdf" }] };

mailer.send(options, function(passed) {

    console.log(passed ? "MAIL SENT" : "MAIL FAILED");

});