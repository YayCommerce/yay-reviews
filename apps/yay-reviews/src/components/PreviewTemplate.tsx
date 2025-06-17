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
            <table border={0} cellPadding={0} cellSpacing={0} className="w-full">
              <tbody>
                <tr>
                  <td id="template_header_image" className="p-8 pb-0">
                    <div
                      className="mb-0 text-left text-lg font-normal"
                      style={{
                        color: window.yayReviews.wc_email_settings.text,
                      }}
                    >
                      {window.yayReviews.site_title}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              border={0}
              cellPadding={0}
              cellSpacing={0}
              className="box-shadow-none w-full rounded-md border-0 bg-white"
              style={{ backgroundColor: window.yayReviews.wc_email_settings.bg }}
            >
              <tbody>
                <tr>
                  <td align="center" valign="top">
                    <table
                      border={0}
                      cellPadding={0}
                      cellSpacing={0}
                      width={100}
                      className="w-full rounded-t-md border-0 font-bold"
                      style={{
                        backgroundColor: window.yayReviews.wc_email_settings.bg,
                        color: window.yayReviews.wc_email_settings.text,
                      }}
                      bgcolor={window.yayReviews.wc_email_settings.bg}
                    >
                      <tbody>
                        <tr>
                          <td className="p-8 pt-5 pb-0">
                            <h1
                              className="m-0 text-left leading-none font-bold tracking-tighter"
                              style={{
                                fontSize: 32,
                                color: window.yayReviews.wc_email_settings.text,
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
                    <table border={0} cellPadding={0} cellSpacing={0} className="w-full">
                      <tbody>
                        <tr>
                          <td
                            valign="top"
                            style={{
                              backgroundColor: window.yayReviews.wc_email_settings.bg,
                            }}
                          >
                            <table border={0} cellPadding={20} cellSpacing={0} className="w-full">
                              <tbody>
                                <tr>
                                  <td valign="top" className="p-8 pt-5">
                                    <div
                                      className="text-left text-base font-normal"
                                      style={{
                                        color: window.yayReviews.wc_email_settings.text,
                                      }}
                                    >
                                      <div className="email-content">
                                        <div
                                          className="mb-4 text-center text-base"
                                          style={{
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
            <table border={0} cellPadding={10} cellSpacing={0} className="w-full">
              <tbody>
                <tr>
                  <td valign="top" className="rounded-none p-0">
                    <table border={0} cellPadding={10} cellSpacing={0} className="w-full">
                      <tbody>
                        <tr>
                          <td
                            colSpan={2}
                            valign="middle"
                            className="rounded-none border-0 border-t border-gray-200 p-8 text-center"
                            style={{ color: window.yayReviews.wc_email_settings.footer_text }}
                            align="center"
                          >
                            <div
                              className="m-0 text-xs"
                              style={{ color: window.yayReviews.wc_email_settings.footer_text }}
                            >
                              {footer}
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
  );
};

export default PreviewTemplate;
