const PreviewTemplate = ({
  heading,
  content,
  footer,
}: {
  heading: string;
  content: string;
  footer: string;
}) => {
  return (
    <table
      border={0}
      cellPadding={0}
      cellSpacing={0}
      id="inner_wrapper"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: '8px',
      }}
      bgcolor={window.yayReviews.wc_email_settings.bg}
    >
      <tbody>
        <tr>
          <td align="center" valign="top">
            <table border={0} cellPadding={0} cellSpacing={0} width={100} style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td id="template_header_image" style={{ padding: '32px 32px 0' }}>
                    <p
                      className="email-logo-text"
                      style={{
                        color: window.yayReviews.wc_email_settings.text,
                        fontFamily: '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                        fontSize: 18,
                        marginBottom: 0,
                        textAlign: 'left',
                      }}
                    >
                      {window.yayReviews.site_title}
                    </p>{' '}
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              border={0}
              cellPadding={0}
              cellSpacing={0}
              id="template_container"
              style={{
                width: '100%',
                boxShadow: 'none',
                backgroundColor: '#fff',
                border: 0,
                borderRadius: '3px',
              }}
              bgcolor={window.yayReviews.wc_email_settings.bg}
            >
              <tbody>
                <tr>
                  <td align="center" valign="top">
                    <table
                      border={0}
                      cellPadding={0}
                      cellSpacing={0}
                      width={100}
                      id="template_header"
                      style={{
                        width: '100%',
                        backgroundColor: window.yayReviews.wc_email_settings.bg,
                        color: window.yayReviews.wc_email_settings.text,
                        borderBottom: 0,
                        fontWeight: 'bold',
                        lineHeight: '100%',
                        verticalAlign: 'middle',
                        fontFamily: '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                        borderRadius: '3px 3px 0 0',
                      }}
                      bgcolor={window.yayReviews.wc_email_settings.bg}
                    >
                      <tbody>
                        <tr>
                          <td
                            id="header_wrapper"
                            style={{ padding: '20px 32px 0', display: 'block' }}
                          >
                            <h1
                              style={{
                                fontFamily: '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                                fontSize: 32,
                                fontWeight: 700,
                                letterSpacing: '-1px',
                                lineHeight: '120%',
                                margin: 0,
                                color: window.yayReviews.wc_email_settings.text,
                                backgroundColor: 'inherit',
                                textAlign: 'left',
                              }}
                            >
                              {heading}
                            </h1>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" valign="top">
                    <table
                      border={0}
                      cellPadding={0}
                      cellSpacing={0}
                      style={{ width: '100%' }}
                      id="template_body"
                    >
                      <tbody>
                        <tr>
                          <td
                            valign="top"
                            id="body_content"
                            style={{
                              backgroundColor: window.yayReviews.wc_email_settings.bg,
                            }}
                          >
                            <table
                              border={0}
                              cellPadding={20}
                              cellSpacing={0}
                              style={{ width: '100%' }}
                            >
                              <tbody>
                                <tr>
                                  <td
                                    valign="top"
                                    id="body_content_inner_cell"
                                    style={{ padding: '20px 32px 32px' }}
                                  >
                                    <div
                                      id="body_content_inner"
                                      style={{
                                        color: window.yayReviews.wc_email_settings.text,
                                        fontFamily:
                                          '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                                        fontSize: '16px',
                                        lineHeight: '150%',
                                        textAlign: 'left',
                                      }}
                                    >
                                      <div className="email-content">
                                        <p
                                          style={{
                                            margin: '0 0 16px',
                                            textAlign: 'center',
                                            fontSize: '16px',
                                            color: window.yayReviews.wc_email_settings.text,
                                          }}
                                          dangerouslySetInnerHTML={{
                                            __html: content,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" valign="top">
            <table
              border={0}
              cellPadding={10}
              cellSpacing={0}
              style={{ width: '100%' }}
              id="template_footer"
            >
              <tbody>
                <tr>
                  <td valign="top" style={{ padding: 0, borderRadius: 0 }}>
                    <table
                      border={0}
                      cellPadding={10}
                      cellSpacing={0}
                      width={100}
                      style={{ width: '100%' }}
                    >
                      <tbody>
                        <tr>
                          <td
                            colSpan={2}
                            valign="middle"
                            id="credit"
                            style={{
                              borderRadius: 0,
                              border: 0,
                              borderTop: '1px solid rgba(0,0,0,.2)',
                              fontFamily: '"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
                              fontSize: 12,
                              lineHeight: '140%',
                              textAlign: 'center',
                              padding: 32,
                              color: window.yayReviews.wc_email_settings.footer_text,
                            }}
                            align="center"
                          >
                            <p
                              style={{
                                margin: 0,
                                color: window.yayReviews.wc_email_settings.footer_text,
                              }}
                            >
                              {footer}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default PreviewTemplate;
