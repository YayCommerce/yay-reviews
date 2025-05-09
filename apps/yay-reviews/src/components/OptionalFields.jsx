import React, { useEffect } from 'react';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, message, Switch, Collapse, Form, Input, Select, Row, Col } from 'antd';
import { __ } from "../utils/Helpers";
import useStore from '../store';

const OptionalFields = () => {
    const [form] = Form.useForm();
    const { triggerSaveOptionalFields, setTriggerSaveOptionalFields, setLoadingSaveButton } = useStore((state) => ({
        triggerSaveOptionalFields: state.triggerSaveOptionalFields,
        setTriggerSaveOptionalFields: state.setTriggerSaveOptionalFields,
        setLoadingSaveButton: state.setLoadingSaveButton
    }));
    const [savedData, setSavedData] = React.useState({'enabled': false, 'fields': []});
    const onFieldChanged = (k, v) => {
        setSavedData({...savedData, [k]: v})
    }
    const cloneItem = (k) => {
        const clonedFields = [...savedData['fields']];
        const itemToClone = clonedFields[k];
        clonedFields.splice(k + 1, 0, { ...itemToClone });
        
        setSavedData({
            ...savedData,
            fields: clonedFields // Update state with cloned array
        });

        message.success(__('item_cloned'));
    }
    const removeItem = (k) => {
        const updatedFields = [...savedData['fields']];
        if(updatedFields.length > 1) {
            updatedFields.splice(k, 1);
            setSavedData({
                ...savedData,
                fields: updatedFields
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
    }
    useEffect(() => {
        fetch(yay_reviews_data.rest_url + '/get-settings', {
          headers: {
            'X-WP-Nonce': yay_reviews_data.rest_nonce
          }
        })
          .then(response => response.json())
          .then(data => {
            let opFieldsData = data['optional_fields'];
            
            if (!opFieldsData['fields'] || opFieldsData['fields'].length === 0) {
                opFieldsData['fields'] = [{}];
            }

            setSavedData(opFieldsData);
          })
          .catch(() => message.error(__('failed_load_state')));
    }, []);

    // Listen for save trigger from main.jsx
    useEffect(() => {
        if (triggerSaveOptionalFields) {
            saveSettings();
        }
    }, [triggerSaveOptionalFields]);

    const saveSettings = () => {
        fetch(yay_reviews_data.rest_url + '/save-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': yay_reviews_data.rest_nonce
            },
            body: JSON.stringify({ optional_fields: savedData }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                message.success(__('settings_saved'));
            } else {
                message.error(__('failed_save_settings'));
            }
            setTriggerSaveOptionalFields(false);
            setLoadingSaveButton(false);
        })
        .catch(() => {
            message.error(__('failed_save_settings'));
            setTriggerSaveOptionalFields(false);
            setLoadingSaveButton(false);
        });
    }
    const onFieldSettingsChanged = (field_key, setting_k, setting_val) => {
        const copied_fields = [...savedData['fields']];
        const changed_item = { ...copied_fields[field_key] };
        changed_item[setting_k] = setting_val;
        copied_fields[field_key] = changed_item;
        setSavedData({
            ...savedData, 
            fields: copied_fields
        });
    }
    // Render a single field form
    const renderFieldForm = (field, field_key) => {
        return (
            <div className="yay-reviews-optional-fields-item" data-field_key={field_key}>
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                label={__('name_asterisk')} 
                                extra={__('name_desc')}
                            >
                                <Input 
                                    value={field.name || ''} 
                                    onChange={(e) => onFieldSettingsChanged(field_key, 'name', e.target.value)} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                label={__('label_text')} 
                                extra={__('label_desc')}
                            >
                                <Input 
                                    value={field.label || ''} 
                                    onChange={(e) => onFieldSettingsChanged(field_key, 'label', e.target.value)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                label={__('type_text')}
                            >
                                <Select 
                                    value={field.type || 'text'} 
                                    onChange={(value) => onFieldSettingsChanged(field_key, 'type', value)}
                                    options={[
                                        {
                                            value: 'text',
                                            label: __('text_field')
                                        },
                                        {
                                            value: 'textarea',
                                            label: __('textarea')
                                        },
                                        {
                                            value: 'dropdown',
                                            label: __('dropdown')
                                        }
                                    ]}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                label={__('value_text')} 
                                extra={__('value_desc')}
                            >
                                <Input 
                                    value={field.value || ''} 
                                    onChange={(e) => onFieldSettingsChanged(field_key, 'value', e.target.value)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    };
    const convertItemsFromState = () => {
        return savedData['fields'].map((field, k) => {
            return {
                key: (k + 1).toString(),
                label: field.label || `Field ${k + 1}`,
                children: renderFieldForm(field, k),
                extra: itemAction(k),
            };
        });
    }
    return (
        <>
        <h1>{ __('optional_fields') }</h1>
        <Form layout="vertical">
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item layout={'horizontal'} label={__('enable')}>
                        <Switch checked={savedData['enabled']} onChange={(checked) => onFieldChanged('enabled', checked)} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={__('fields')}>
                        <Collapse bordered={false} items={convertItemsFromState()} defaultActiveKey={['1']} />
                    </Form.Item>
                </Col>
            </Row>

        </Form>
        </>
    );
}
export default OptionalFields;