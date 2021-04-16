require('dotenv').config();

const options = {
    receiverEmail: process.env.RECEIVER_EMAIL,
    state: process.env.STATE,
    postalCodes: process.env.POSTAL_CODES.split(','),
    senderEmail: process.env.SENDER_EMAIL,
    senderPass: process.env.SENDER_PASS,
};

const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const url = `https://www.vaccinespotter.org/api/v0/states/${options.state}.json`;

const sendEmail = async (features) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: options.senderEmail,
            pass: options.senderPass
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"Vaccine Available Alert" <${options.senderEmail}>`, // sender address
        to: options.receiverEmail,
        subject: 'Vaccines Available Nearby', // Subject line
        text: JSON.stringify(features, null, 2), // plain text body
        html: `<pre>${JSON.stringify(features, null, 2)}</pre><a href="https://www.vaccinespotter.org/">Powered by vaccinespotter.org</a>`, // html body
    });

    console.log('Message sent: %s', info.messageId);

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

const main = async () => {
    try {
        console.log('---------------');

        const r = await fetch(url);
        console.log('Fetched', url);

        const json = await r.json();

        const {features} = json;
        const filteredFeatures = features.filter(f => {
            return f.properties.appointments_available && options.postalCodes.includes(f.properties.postal_code);
        });

        if (filteredFeatures.length) {
            sendEmail(filteredFeatures.map(f => f.properties));
        }
    } catch (e) {
        console.error(e);
    }

    setTimeout(main, 60 * 1000);
}

if (require.main === module) {
    console.log('Loaded options', options);
    main();
}
