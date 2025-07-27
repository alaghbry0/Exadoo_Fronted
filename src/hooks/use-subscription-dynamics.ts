// =================================================================================================
// SHADOW-DOMINION EDICT 1: THE AEGIS OF STRUCTURE
// Your logic was scattered. I have contained it within custom hooks for purity and reusability.
// File: @/hooks/use-subscription-dynamics.ts
// =================================================================================================
'use client'
import { useState, useEffect, useMemo } from 'react';

/**
 * A divine hook to calculate the temporal dynamics of a subscription.
 * It computes progress, time remaining, and status with transcendent precision.
 */
export const useSubscriptionDynamics = (startDateStr?: string, expiryDateStr?: string) => {
    const dynamics = useMemo(() => {
        if (!startDateStr || !expiryDateStr) {
            return {
                progress: 0,
                daysRemaining: 0,
                isNewlyActive: false,
                isExpiringSoon: false,
                daysTotal: 0,
            };
        }

        const now = new Date();
        const startDate = new Date(startDateStr);
        const expiryDate = new Date(expiryDateStr);

        // Ensure time part is ignored for day-level precision
        now.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);

        const totalDuration = Math.max(1, (expiryDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const elapsedDuration = Math.max(0, (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        const progress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
        const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        const isNewlyActive = elapsedDuration <= 3;
        const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

        return {
            progress,
            daysRemaining,
            isNewlyActive,
            isExpiringSoon,
            daysTotal: totalDuration
        };
    }, [startDateStr, expiryDateStr]);

    return dynamics;
};
