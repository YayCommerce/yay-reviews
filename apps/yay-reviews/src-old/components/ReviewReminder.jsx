import React, { useEffect } from 'react';
import useStore from '../store';
import { Button, Switch, Input, message, Select, ColorPicker, Modal, Form, Row, Col } from 'antd';
import ReactQuill from 'react-quill';
import AjaxSelect from '../utils/AjaxSelect';
import Helpers from '../utils/Helpers';
import { __ } from "../utils/Helpers";
import PreviewEmailServices from '../services/previewEmailServices';
import SettingsServices from '../services/SettingServices'
import { productFetchOptions, categoryFetchOptions } from '../fetchOptions';

const ReviewReminder = () => {
  const [form] = Form.useForm();
  const { reviewReminder, setReviewReminder, triggerSaveReviewReminder, setTriggerSaveReviewReminder, setLoadingSaveButton } = useStore((state) => ({
      reviewReminder: state.reviewReminder,
      setReviewReminder: state.setReviewReminder,
      triggerSaveReviewReminder: state.triggerSaveReviewReminder,
      setTriggerSaveReviewReminder: state.setTriggerSaveReviewReminder,
      setLoadingSaveButton: state.setLoadingSaveButton
  }));
    
    const [loading, setLoading] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalLoading, setModalLoading] = React.useState(false);
    const [modalContent, setModalContent] = React.useState("");

    const previewEmail = () => {
      setModalOpen(true)
      setModalLoading(true)
      PreviewEmailServices.send('reminder', reviewReminder, (data) => {
        setModalLoading(false)
        if (data.success) {
          setModalContent(data.html)
        } else {
            message.error(__('failed_preview_email'));
        }
      }, () => {
        setModalLoading(false)
        message.error(__('failed_preview_email'));
      })
    }

    // Fetch the initial state from the server
    useEffect(() => {
      SettingsServices.getSettings((data) => {
          setReviewReminder(data['reviewReminder']);
          form.setFieldsValue(data['reviewReminder']);
      }, () => {
          message.error(__('failed_load_state'))
      })
    }, []);
    
    // Listen for save trigger from main.jsx
    useEffect(() => {
        if (triggerSaveReviewReminder) {
            saveSettings();
        }
    }, [triggerSaveReviewReminder]);

    const saveSettings = () => {
        setLoading(true);
        fetch(yay_reviews_data.rest_url + '/save-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': yay_reviews_data.rest_nonce
            },
            body: JSON.stringify({ reviewReminder: reviewReminder }),
        })
        .then(response => response.json())
        .then(data => {
            setLoading(false);
            if (data.success) {
                message.success(__('settings_saved'));
            } else {
                message.error(__('failed_save_settings'));
            }
            setTriggerSaveReviewReminder(false);
            setLoadingSaveButton(false);
        })
        .catch(() => {
            setLoading(false);
            message.error(__('failed_save_settings'));
            setTriggerSaveReviewReminder(false);
            setLoadingSaveButton(false);
        });
    };

    const onFieldChanged = (k, v) => {
      if( k == 'exclude_emails') {
        v = filterEmails(v)
      }
      setReviewReminder({...reviewReminder, [k]: v})
    }
    const filterEmails = (items) => {
      return items.filter(item => Helpers.isEmail(item.trim()));
    }

    return (
        <>
          <h1>{__('review_reminder')}</h1>
          <Form
              form={form}
              layout="vertical"
              initialValues={reviewReminder}
              onFinish={saveSettings}
              >
              <Row gutter={16}>
                <Col span={6}>
                    <Form.Item layout='horizontal' name="enabled" label={__('enable')} tooltip={__('review_reminder_tooltip')}>
                      <Switch  />
                    </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="order_status" label={__('order_status')}>
                    <Select options={yay_reviews_data.order_statuses} mode="multiple" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="exclude_emails" label={__('exclude_emails')}>
                    <Select mode="tags" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="exclude_products" label={__('exclude_products')}>
                    <AjaxSelect fetchOptions={productFetchOptions} mode='multiple' placeholder={__('search_products')} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="exclude_categories" label={__('exclude_categories')}>
                    <AjaxSelect fetchOptions={categoryFetchOptions} mode='multiple' placeholder={__('search_categories')} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="custom_from_address" label={__('custom_from_address')}>
                    <Input  />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="schedule_value" label={__('schedule_time')}>
                    <Input type='number' />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="schedule_unit" label={__('schedule_unit')}>
                    <Select options={[
                      {
                        value: 'seconds',
                        label: __('seconds')
                      },
                      {
                        value: 'minutes',
                        label: __('minutes')
                      },
                      {
                        value: 'hours',
                        label: __('hours')
                      },
                      {
                        value: 'days',
                        label: __('days')
                      }
                    ]} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="email_review_btn_text" label={__('review_now_button_text')}>
                      <Input />
                    </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="order_status_to_show_review_at_orders" label={__('button_review_orders')}>
                      <Select options={yay_reviews_data.order_statuses} style={{ width: '100%' }} mode='multiple' />
                    </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item layout='horizontal' name="email_review_btn_color" label={__('review_now_text_color')}>
                    <ColorPicker format="hex" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item layout='horizontal' name="email_review_btn_bg_color" label={__('review_now_bg_color')}>
                    <ColorPicker format="hex" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                  <Col span={6}>
                  <Form.Item name="email_subject" label={__('mail_subject')}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="email_heading" label={__('mail_heading')}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row> 

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item >
                    <Button onClick={ previewEmail }>{__('preview_email')}</Button>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="email_content" label={__('mail_content')}>
                    <ReactQuill theme="snow" />
                  </Form.Item>
                  <Form.Item >
                    <div dangerouslySetInnerHTML={ { __html: __('customer_reminder_vars') } }></div>
                  </Form.Item>
                </Col>
              </Row>

              
              

              
          </Form>
          <Modal loading={modalLoading} open={modalOpen} onCancel={() => setModalOpen(false)} footer={[<Button key="back" onClick={() => { setModalOpen(false) }}>
            {__('close')}
          </Button>]} width={1000}><div dangerouslySetInnerHTML={ {__html: modalContent} }></div></Modal>
        </>
    );
}
export default ReviewReminder;