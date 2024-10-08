import dotenv from 'dotenv';
dotenv.config();
const Mailjet = require('node-mailjet');

export class MailService {
  public async sendEmail(
    email: string,
    subject: string,
    content: string,
    firstname: string,
    lastname: string,
    link: string
  ): Promise<any> {
    // const mailjet = new Mailjet({
    //   apiKey: process.env.MJ_APIKEY_PUBLIC,
    //   apiSecret: process.env.MJ_APIKEY_PRIVATE,
    // });
    const mailjet = require('node-mailjet').apiConnect(
      process.env.MJ_APIKEY_PUBLIC,
      process.env.MJ_APIKEY_PRIVATE
    );
    console.log(process.env.MJ_APIKEY_PRIVATE)
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'juniortagne2001@gmail.com',
            Name: 'Elohim',
          },
          To: [
            {
              Email: 'juniortagne2001@gmail.com',
              Name: `${firstname} `,
            },
          ],
          Subject: subject,
          TextPart: subject,
          HTMLPart: "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
          CustomID: "AppGettingStartedTest"
          // HTMLPart: await this.getTemplate(content, subject, link, disclaimer, buttonText),
        },
      ],
    });
    request
      .then(result => {
        console.log(result.body)
      })
      .catch(err => {
        console.error(err.statusCode, err.message);
      });
  }

  public async getTemplate(content: string, prehead: string, linkUrl: string, disclaimer: string, buttonText: string): Promise<string> {
    return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">

    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
      <meta name="format-detection" content="telephone=no" />
      <title>Template Kipdev.io</title>
      <style type="text/css">
        /* -------------------------------------
		   RESET STYLE
		   ------------------------------------- */
        body,
        #bodyTable,
        #bodyCell,
        #bodyCell {
          height: 100% !important;
          margin: 0;
          padding: 0;
          width: 100% !important;
          font-family: sans-serif;
        }

        table {
          border-collapse: collapse;
        }

        table[id=bodyTable] {
          width: 100% !important;
          margin: auto;
          max-width: 600px !important;
          color: #4A5056;
          font-weight: normal;
        }

        /* -------------------------------------
		   COMPATIBILITY
		   ------------------------------------- */
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }

        img {
          -ms-interpolation-mode: bicubic;
          outline: none;
          text-decoration: none;
        }

        body,
        table,
        td,
        p,
        a,
        li,
        blockquote {
          -ms-text-size-adjust: 100%;
          -webkit-text-size-adjust: 100%;
          font-weight: normal !important;
        }

        /* -------------------------------------
		   STRUCTURE
		   ------------------------------------- */
        body,
        #bodyTable {
          background-color: #fff;
        }

        #emailHeader {
          background-color: #fff;
        }

        #emailTitle {
          background: #222529;
          border-radius: 6px 6px 0px 0px;
        }

        #emailBody {
          background-color: #F7FAFC;
          border-radius: 0px 0px 6px 6px;
          border: 1px solid #E2E8F0;
        }

        #emailFooter {
          background-color: #fff;
        }

        /* -------------------------------------
		   LOGO
		   ------------------------------------- */
        .logo {
          width: 100%;
          text-align: center;
          margin-top: 24px;
          margin-bottom: 24px;
        }

        /* -------------------------------------
		   TYPOGRAPHY
		   ------------------------------------- */
        .top-text,
        #emailFooter p {
          font-family: Arial;
          font-style: normal;
          font-size: 11px;
          line-height: 16px;
          text-align: center;
          color: #4A5056;
        }

        .email-title-text {
          text-align: left;
          width: 100%;
          font-family: Arial;
          font-style: normal;
          font-weight: bold;
          font-size: 19px;
          line-height: 22px;
          color: #fff;
        }

        #emailBody p {
          font-family: Arial;
          font-style: normal;
          font-weight: normal;
          font-size: 14px;
          line-height: 24px;
          color: #4A5568;
          margin-bottom: 15px;
        }

        #emailBody .code {
          font-family: Arial;
          font-style: normal;
          font-weight: bold;
          font-size: 26px;
          line-height: 24px;
          color: #0D52A1;
          margin-top: -8px;
          display: block;
        }

        #emailBody .help-text {
          font-family: Arial;
          font-style: normal;
          font-weight: normal;
          font-size: 11px;
          line-height: 16px;
          display: block;
          text-align: center;
          color: #4A5056;
        }

        #emailBody .center-text {
          text-align: center;
          width: 100%;
          font-family: Arial;
          font-style: normal;
          font-weight: normal;
          font-size: 12px;
          line-height: 20px;
          text-align: center;
          color: #6E757C;
        }

        #emailBody ul {
          list-style: none;
          padding-left: 0;
        }

        #emailBody ul li {
          margin-bottom: 16px;
          position: relative;
          padding-left: 24px;
          font-size: 15px;
          line-height: 24px;
          color: #4a5568;
          font-weight: normal;
        }

        #emailBody ul li:before {
          content: "";
          position: absolute;
          width: 4px;
          height: 4px;
          top: 10px;
          left: 4px;
          border-radius: 4px;
          background: #0054A8;
          z-index: 1;
        }

        #emailBody ul li:after {
          content: "";
          position: absolute;
          top: 5.5px;
          left: 0;
          width: 12px;
          height: 12px;
          border-radius: 12px;
          background-color: #d8ecd0;
        }

        #emailBody a {
          font-family: Arial;
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 16px;
          color: #0091EA;
          text-decoration: none;
        }

        #emailBody a:hover {
          transition: 0.4s;
          color: #0091EA;
        }

        #emailBody .help-link {
          font-family: Arial;
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 16px;
          color: #0091EA;
          text-decoration: none;
          font-size: 11px;
          line-height: 16px;
          display: block;
          text-align: center;
        }

        #emailBody .help-link:hover {
          transition: 0.4s;
          color: #0D52A1;
        }

        #emailHeader a,
        #emailFooter a {
          font-family: Arial;
          font-style: normal;
          font-weight: 500;
          font-size: 11px;
          color: #0091EA;
          text-decoration: none;
        }

        #emailHeader a:hover,
        #emailFooter a:hover {
          transition: 0.4s;
          color: #0D52A1;
        }

        /* -------------------------------------
		   BUTTONS
		   ------------------------------------- */
        .btn {
          border-radius: 6px;
          background-color: #6B21A8;
          text-align: center;
          border: none;
          cursor: pointer;
        }

        .btn:hover {
          transition: 0.4s;
          background-color: #6B21A8;
        }

        .btn-text {
          color: #ffffff !important;
          font-family: Arial !important;
          font-weight: bold !important;
          font-size: 14px !important;
        }

        .btn-2,
        a.btn-2 {
          height: 42px;
          width: 217px;
          border-radius: 6px;
          background-color: #6B21A8;
          display: block;
          margin: 24px auto;
          color: #ffffff !important;
          font-family: Arial !important;
          font-size: 14px !important;
          font-weight: bold !important;
          cursor: pointer;
          line-height: 42px !important;
          padding: 0 24px;
          text-align: center !important;
          border: none;
          cursor: pointer;
        }

        .btn-2:hover,
        a.btn-2:hover {
          transition: 0.4s;
          background-color: #6B21A8;
        }

        /* -------------------------------------
		   MOBILE
		   ------------------------------------- */
        @media only screen and (max-width: 480px) {

          body {
            width: 100% !important;
            min-width: 100% !important;
          }

          table[id="emailHeader"],
          table[id="emailBody"],
          table[id="emailFooter"],
          table[id="emailTitle"],
          table[class="flexibleContainer"] {
            width: 100% !important;
          }

          td[class="flexibleContainerBox"],
          td[class="flexibleContainerBox"] table {
            display: block;
            width: 100%;
            text-align: left;
          }
        }
      </style>
      <!--[if mso 12]>
		 <style type="text/css">
			 .flexibleContainer{display:block !important; width:100% !important;}
		 </style>
	 <![endif]-->

      <!--[if mso 14]>
		 <style type="text/css">
			 .flexibleContainer{display:block !important; width:100% !important;}
		 </style>
	 <![endif]-->
      <!--[if gte mso 9]>
		 <style>
			 ul {
				 padding-left: 0 !important;
			 }
		 </style>
	  <![endif]-->

    </head>

    <body bgcolor="#fff" leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0">
      <center style="background-color: #fff;">
        <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="table-layout: fixed; max-width:100% !important; width: 100% !important; min-width: 100% !important;">
          <tr>
            <td align="center" valign="top" id="bodyCell">


              <!-- ***************************  HEADER = TOP-TEXT + LOGO *************************** -->
              <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600" id="emailHeader">
                <tr>
                  <td align="center" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" valign="top">
                          <table border="0" cellpadding="10" cellspacing="0" width="600" class="flexibleContainer">
                            <tr>
                              <td valign="top" width="600">
                                <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                                  <tr>
                                    <td valign="middle" class="flexibleContainerBox">
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:100%; margin-top: 24px;">
                                        <tr>
                                          <td align="left">
                                            <div class="logo">
                                              <img style="max-width: 300px;" src="data:image/png;base64,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" />
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- *************************** END HEADER = TOP-TEXT + LOGO *************************** -->





              <!-- *************************** EMAIL TITLE *************************** -->
              <table bgcolor="#fff" border="0" cellpadding="0" cellspacing="0" width="600" id="emailTitle">
                <tr>
                  <td align="center" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" valign="top">
                          <table border="0" cellpadding="32" cellspacing="0" width="600" class="flexibleContainer">
                            <tr>
                              <td valign="top" width="600">
                                <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                                  <tr>
                                    <td valign="middle" class="flexibleContainerBox">
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:100%;">
                                        <tr>
                                          <td align="left">
                                            <div class="email-title-text">
                                              ${prehead}
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- ***************************  END EMAIL TITLE *************************** -->





              <!-- *************************** EMAIL CONTENT *************************** -->
              <table bgcolor="#F7FAFC" border="0" cellpadding="0" cellspacing="0" width="598" id="emailBody">
                <tr>
                  <td align="center" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="598" class="flexibleContainer">
                            <tr>
                              <td align="center" valign="top" width="598">
                                <table border="0" cellpadding="32" cellspacing="0" width="100%">
                                  <tr>
                                    <td align="center" valign="top">
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                          <td valign="top">
                                            <p>
                                              ${content}
                                            </p>


                                            <!--[if gte mso 9]>
																				 <table border="0" cellpadding="0" cellspacing="0" width="100%">
																					 <tr style="padding-top:40px;">
																						 <td align="center" valign="top">
																							 <table border="0" cellpadding="30" cellspacing="0" width="598" class="flexibleContainer">
																								 <tr>
																									 <td style="padding-top:0;" align="center" valign="top" width="598">
																										 <table border="0" cellpadding="0" cellspacing="0" width="60%" class="btn">
																											 <tr>
																												 <td align="center" valign="middle" style="padding: 12px 24px;">
																													 <a class="btn-text" href="${linkUrl}" target="_blank">${buttonText}</a>
																												 </td>
																											 </tr>
																										 </table>

																									 </td>
																								 </tr>
																							 </table>
																						 </td>
																					 </tr>
																				 </table>
																				 <![endif]-->

                                            <!--[if !mso]>-->
                                            <a href="${linkUrl}" class="btn-2">${buttonText}</a>
                                            <!--<![endif]-->


                                            <div class="center-text">
                                              ${disclaimer}
                                            </div>


                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- *************************** END EMAIL CONTENT *************************** -->
            </td>
          </tr>
        </table>
      </center>
    </body>


    `;
  }
}
