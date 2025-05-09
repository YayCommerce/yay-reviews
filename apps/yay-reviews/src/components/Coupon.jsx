import React, { useEffect } from 'react';
import { Button, message, Switch, Collapse, Modal, Form, Input, Select, Row, Col } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AjaxSelect from '../utils/AjaxSelect';
import PreviewEmailServices from '../services/previewEmailServices';
import { __ } from "../utils/Helpers";
import { productFetchOptions, categoryFetchOptions, couponFetchOptions } from '../fetchOptions';
import useStore from '../store';

const Coupon = () => {
    const [form] = Form.useForm();
    const { triggerSaveCoupon, setTriggerSaveCoupon, setLoadingSaveButton } = useStore((state) => ({
        coupon: state.coupon,
        setCoupon: state.setCoupon,
        triggerSaveCoupon: state.triggerSaveCoupon,
        setTriggerSaveCoupon: state.setTriggerSaveCoupon,
        setLoadingSaveButton: state.setLoadingSaveButton
    }));
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalLoading, setModalLoading] = React.useState(false);
    const [modalContent, setModalContent] = React.useState("");
    const [previewEmailLoading, setPreviewEmailLoading] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [savedData, setSavedData] = React.useState({'enabled': false, 'coupons': []});

    const previewEmail = (coupon_key) => {
        setPreviewEmailLoading(true);
        const selected_coupon = {...savedData['coupons'][coupon_key]};
        
        PreviewEmailServices.send('coupon', selected_coupon, (data) => {
            setModalLoading(false);
            setPreviewEmailLoading(false);
            if (data.success) {
                setModalOpen(true);
                setModalContent(data.html);
            } else {
                message.error(__('failed_preview_email'));
            }
        }, () => {
            setModalLoading(false);
            setPreviewEmailLoading(false);
            message.error(__('failed_preview_email'));
        });
    };

    const onFieldChanged = (k, v) => {
        setSavedData({...savedData, [k]: v});
    };
    
    const cloneItem = (k) => {
        const clonedCoupons = [...savedData['coupons']]; // Copy the existing coupons
        const itemToClone = clonedCoupons[k]; // Find the item to clone
        clonedCoupons.splice(k + 1, 0, { ...itemToClone }); // Insert the cloned item after the original
        
        setSavedData({
            ...savedData,
            coupons: clonedCoupons // Update state with cloned array
        });

        message.success(__('item_cloned'));
    };

    const removeItem = (k) => {
        const updatedCoupons = [...savedData['coupons']]; // Copy the existing coupons
        if(updatedCoupons.length > 1) {
            updatedCoupons.splice(k, 1); // Remove the item at index 'k'
            setSavedData({
                ...savedData,
                coupons: updatedCoupons // Update state with the new coupons array
            });
            message.success(__('item_removed'));
        } else {
            message.error(__('last_item_delete_error'));
        }
    };
    
    const itemAction = (k) => {
        return (
            <div className='display-flex'>
                <CopyOutlined 
                    onClick={(event) => {
                        event.stopPropagation();
                        cloneItem(k);
                    }} 
                    style={{ marginRight: '10px', cursor: 'pointer' }}
                />
                <DeleteOutlined 
                    onClick={(event) => {
                        event.stopPropagation();
                        removeItem(k);
                    }}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        );
    };

    useEffect(() => {
        fetch(yay_reviews_data.rest_url + '/get-settings', {
          headers: {
            'X-WP-Nonce': yay_reviews_data.rest_nonce
          }
        })
          .then(response => response.json())
          .then(data => {
            let couponData = data['coupon'];
            
            // Check if 'coupons' is empty or undefined
            if (!couponData['coupons'] || couponData['coupons'].length === 0) {
                // Create a default coupon if it's empty
                couponData['coupons'] = [{}];
            }

            setSavedData(couponData);
          })
          .catch(() => message.error(__('failed_load_state')));
    }, []);

    // Listen for save trigger from main.jsx
    useEffect(() => {
        if (triggerSaveCoupon) {
            saveSettings();
        }
    }, [triggerSaveCoupon]);

    const saveSettings = () => {
        setLoading(true);
        fetch(yay_reviews_data.rest_url + '/save-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': yay_reviews_data.rest_nonce
            },
            body: JSON.stringify({ coupon: savedData }),
        })
        .then(response => response.json())
        .then(data => {
            setLoading(false);
            if (data.success) {
                message.success(__('settings_saved'));
            } else {
                message.error(__('failed_save_settings'));
            }
            setTriggerSaveCoupon(false);
            setLoadingSaveButton(false);
        })
        .catch(() => {
            setLoading(false);
            message.error(__('failed_save_settings'));
            setTriggerSaveCoupon(false);
            setLoadingSaveButton(false);
        });
    };

    const onCouponSettingsChanged = (coupon_key, setting_k, setting_val) => {
        const copied_coupons = [...savedData['coupons']];
        const changed_item = { ...copied_coupons[coupon_key] };
        changed_item[setting_k] = setting_val;
        copied_coupons[coupon_key] = changed_item;
        setSavedData({
            ...savedData, 
            coupons: copied_coupons
        });
    };

    // Render a single coupon form
    const renderCouponForm = (coupon, coupon_key) => {
        return (
            <div className="yay-reviews-coupon-item" data-coupon_key={coupon_key}>
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label={__('choose_coupon')}>
                                <AjaxSelect 
                                    fetchOptions={couponFetchOptions} 
                                    mode={null} 
                                    value={coupon.coupon_code} 
                                    onChange={(value) => onCouponSettingsChanged(coupon_key, 'coupon_code', value)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label={__('registered_account_required')} extra={__('registered_account_desc')}>
                                <Switch 
                                    checked={coupon.only_registered_account} 
                                    onChange={(checked) => onCouponSettingsChanged(coupon_key, 'only_registered_account', checked)} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={__('upload_required_label')} extra={__('upload_required_desc')}>
                                <Switch 
                                    checked={coupon.upload_required} 
                                    onChange={(checked) => onCouponSettingsChanged(coupon_key, 'upload_required', checked)} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={__('verified_owner_required')} extra={__('verified_owner_desc')}>
                                <Switch 
                                    checked={coupon.only_verified_owner} 
                                    onChange={(checked) => onCouponSettingsChanged(coupon_key, 'only_verified_owner', checked)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item className='yayr-row-ptb-0' label={__('minimum_rating')} extra={__('minimum_rating_desc')}>
                                <Input 
                                    type="number" 
                                    min={0} 
                                    max={5} 
                                    suffix={__('stars')} 
                                    value={coupon.minimum_rating} 
                                    onChange={(e) => onCouponSettingsChanged(coupon_key, 'minimum_rating', e.target.value)} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={__('required_categories')} extra={__('required_categories_desc')}>
                                <AjaxSelect 
                                    fetchOptions={categoryFetchOptions} 
                                    value={coupon.required_categories} 
                                    onChange={(value) => onCouponSettingsChanged(coupon_key, 'required_categories', value)} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={__('exclude_categories')} extra={__('exclude_categories_desc')}>
                                <AjaxSelect 
                                    fetchOptions={categoryFetchOptions} 
                                    value={coupon.exclude_categories} 
                                    onChange={(value) => onCouponSettingsChanged(coupon_key, 'exclude_categories', value)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={__('required_products')} extra={__('required_products_desc')}>
                                <AjaxSelect 
                                    fetchOptions={productFetchOptions} 
                                    value={coupon.required_products} 
                                    onChange={(value) => onCouponSettingsChanged(coupon_key, 'required_products', value)} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={__('exclude_products')} extra={__('exclude_products_desc')}>
                                <AjaxSelect 
                                    fetchOptions={productFetchOptions} 
                                    value={coupon.exclude_products} 
                                    onChange={(value) => onCouponSettingsChanged(coupon_key, 'exclude_products', value)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label={__('email_subject')}>
                                <Input 
                                    value={coupon.email_subject || ''} 
                                    onChange={(e) => onCouponSettingsChanged(coupon_key, 'email_subject', e.target.value)} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={__('email_heading')}>
                                <Input 
                                    value={coupon.email_heading || ''} 
                                    onChange={(e) => onCouponSettingsChanged(coupon_key, 'email_heading', e.target.value)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Button 
                            loading={previewEmailLoading} 
                            onClick={() => previewEmail(coupon_key)}
                        >
                            {__('preview_email')}
                        </Button>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label={__('email_content')}>
                                <ReactQuill 
                                    theme="snow" 
                                    value={coupon.email_content || ''} 
                                    onChange={(value) => onCouponSettingsChanged(coupon_key, 'email_content', value)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item>
                                <div dangerouslySetInnerHTML={{ __html: __('customer_coupon_vars') }}></div>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    };

    const convertItemsFromState = () => {
        return savedData['coupons'].map((coupon, k) => {
            return {
                key: (k + 1).toString(),
                label: coupon.coupon_code || `Coupon ${k + 1}`,
                children: renderCouponForm(coupon, k),
                extra: itemAction(k),
            };
        });
    };

    return (
        <>
            <h1>{__('coupon_text')}</h1>
            <Form layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item layout={'horizontal'} label={__('enable')} tooltip={__('coupon_tooltip')}>
                            <Switch 
                                checked={savedData['enabled']} 
                                onChange={(checked) => onFieldChanged('enabled', checked)} 
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label={__('coupons')}>
                            <Collapse 
                                bordered={false} 
                                items={convertItemsFromState()} 
                                defaultActiveKey={['1']} 
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <Modal 
                loading={modalLoading} 
                open={modalOpen} 
                onCancel={() => setModalOpen(false)} 
                footer={[
                    <Button key="back" onClick={() => setModalOpen(false)}>
                        {__('close')}
                    </Button>
                ]} 
                width={1000}
            >
                <div dangerouslySetInnerHTML={{ __html: modalContent }}></div>
            </Modal>
        </>
    );
};

export default Coupon;