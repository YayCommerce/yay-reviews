import { create } from 'zustand';

const useStore = create((set) => ({
    general: {},
    setGeneral: (value) => set({ general: value }),
    triggerSaveGeneral: false,
    setTriggerSaveGeneral: (value) => set({ triggerSaveGeneral: value }),

    reviews: {},
    setReviews: (value) => set({ reviews: value }),
    triggerSaveReviews: false,
    setTriggerSaveReviews: (value) => set({ triggerSaveReviews: value }),

    reviewReminder: {},
    setReviewReminder: (value) => set({ reviewReminder: value }),
    triggerSaveReviewReminder: false,
    setTriggerSaveReviewReminder: (value) => set({ triggerSaveReviewReminder: value }),

    exportReviews: {},
    setExportReviews: (value) => set({ exportReviews: value }),

    triggerSaveCoupon: false,
    setTriggerSaveCoupon: (value) => set({ triggerSaveCoupon: value }),

    optionalFields: {},
    setOptionalFields: (value) => set({ optionalFields: value }),
    triggerSaveOptionalFields: false,
    setTriggerSaveOptionalFields: (value) => set({ triggerSaveOptionalFields: value }),

    loadingSaveButton: false,
    setLoadingSaveButton: (value) => set({ loadingSaveButton: value }),
}));

export default useStore;
