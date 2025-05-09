import React, { useEffect } from 'react';
import { ConfigProvider, Button, message, Collapse } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';

import FieldHelpers from '../utils/FieldHelpers';

const CouponCollapse = ({ items, ...rest }) => {
    const [convertedItems, setConvertedItems] = React.useState([]);

    const cloneCollapseItem = (k) => {
        // Clone the current state
        const newItems = [...convertedItems];
        
        // Clone the item at position k
        const clonedItem = { ...newItems[k] };
        clonedItem['key'] = (parseInt(k) + 1).toString()
        clonedItem['label'] = 'Coupon ' + (parseInt(k) + 1).toString()
        // Insert the cloned item at position k + 1
        newItems.splice(k + 1, 0, clonedItem);
        
        // Update the state with the new array
        setConvertedItems(newItems);
    }

    const itemAction = (k) => {
        return (
            <p className='display-flex'>
                <CopyOutlined onClick={(event) => {
                    event.stopPropagation();
                    cloneCollapseItem(k)
                }} />
                { k > 0 && <DeleteOutlined onClick={(event) => {
                    event.stopPropagation();
                }} /> }
            </p>
        )
    }
    const onCouponFieldChanged = (k, v) => {
        console.log(v)
    }
    const coupon_fields = [
        {
            type: 'ajax_select',
            name: 'coupon',
            label: 'Choose a coupon',
            desc: '',
            fetchOptions: 'couponFetchOptions',
            mode: null
        },
        {
            type: 'switcher',
            name: 'only_registered_account',
            label: 'Registered-account email is required',
            desc: 'Only send coupons if author\'s email is registered an account'
        },
        {
            type: 'switcher',
            name: 'upload_required',
            label: 'Upload Required',
            desc: 'Only send coupons for reviews including photos or videos'
        },
        {
            type: 'switcher',
            name: 'only_verified_owner',
            label: 'Verified owner is required',
            desc: 'Only send coupon for reviews from purchased customers.'
        },
        {
            type: 'text',
            input_type: 'number',
            more: {
                min: 0,
                max: 5
            },
            suffix: 'stars',
            name: 'minimum_rating',
            label: 'Minimum required rating',
            desc: 'Only send coupons for reviews if rating is equal or greater than this value'
        },
        {
            type: 'ajax_select',
            name: 'required_categories',
            label: 'Required categories',
            desc: 'Only reviews on products in these categories can receive coupon',
            fetchOptions: 'categoryFetchOptions'
        },
        {
            type: 'ajax_select',
            name: 'exclude_categories',
            label: 'Exclude categories to give coupon',
            desc: 'Reviews on products in these categories will not receive coupon',
            fetchOptions: 'categoryFetchOptions'
        },
        {
            type: 'ajax_select',
            name: 'required_products',
            label: 'Required Products',
            desc: 'Only reviews on selected products can receive coupons. Leave blank to apply for all products',
            fetchOptions: 'productFetchOptions'
        },
        {
            type: 'ajax_select',
            name: 'exclude_products',
            label: 'Exclude products to give coupon',
            desc: 'Reviews on these products will not receive coupon',
            fetchOptions: 'productFetchOptions'
        }
    ]

    useEffect(() => {
        if(typeof items == 'undefined' || items.length == 0) {
            setConvertedItems([
                {
                    key: '1',
                    label: 'Coupon 1',
                    children: FieldHelpers.renderFields(coupon_fields, {}, (k, v) => { console.log(k)}),
                    extra: itemAction(0),
                }
            ])
        } else {
            const items2 = items.map((k, v) => {
                return {
                    key: k.toString(),
                    label: 'Coupon ' + k.toString(),
                    children: FieldHelpers.renderFields(coupon_fields, {}, (k, v) => { console.log(k)}),
                    extra: itemAction(k),
                }
            })
            setConvertedItems(items2)
        }
    }, []);

    return (
        <>
        <Collapse items={ convertedItems } {...rest} />
        </>
    )
}
export default CouponCollapse;