import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { ConfigProvider, message, Upload } from 'antd';
import { __ } from "../utils/Helpers";

const { Dragger } = Upload;
const props = {
  name: 'file',
  multiple: false,
  action: yay_reviews_data.rest_url + '/import-reviews',
  headers: {
    'X-WP-Nonce': yay_reviews_data.rest_nonce
  },
  onChange(info) {
    const { status } = info.file;
    // if (status !== 'uploading') {
    //   console.log(info.file, info.fileList);
    // }
    if (status === 'done') {
      message.success(__('import_success'));
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    // console.log('Dropped files', e.dataTransfer.files);
  },
};
const ImportReviews = () => (
  <>
    {/* <h1>Import Reviews</h1> */}
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{ __('click_drag_import') }</p>
    </Dragger>
  </>
);
export default ImportReviews;