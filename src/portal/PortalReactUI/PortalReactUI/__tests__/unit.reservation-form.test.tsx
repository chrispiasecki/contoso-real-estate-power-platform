// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as React from 'react';
import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
import { reserveListing } from '../api/listingsApi';
import ReservationForm from '../components/ReservationForm';
import { navigateToPage } from '../api/navigation';

jest.mock('../api/listingsApi');
jest.mock('../api/navigation');

describe('ReservationForm', () => {
    test('calls reserve api for selected dates', async () => {
        const mockProps = {
            listingId: '123',
        };

        const startDate = new Date();
        const endDate = new Date();

        // Set StartDate to  2024-08-29T00:00:00.000Z
        startDate.setFullYear(2024);
        startDate.setMonth(7);
        startDate.setDate(29);
        startDate.setHours(0);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        // Set EndDate to 2024-08-30T00:00:00.000Z
        endDate.setFullYear(2024);
        endDate.setMonth(7);
        endDate.setDate(30);
        endDate.setHours(0);
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);

        act(() => {
            render(<ReservationForm {...mockProps} />);
        });

        act(() => {
            fireEvent.change(screen.getByLabelText('Start Date:'), { target: { value: startDate } });
            fireEvent.change(screen.getByLabelText('End Date:'), { target: { value: endDate } });
            fireEvent.change(screen.getByLabelText('Number of Guests:'), { target: { value: '2' } });
            fireEvent.click(screen.getByText('RESERVE'));
        });

        waitFor(() => {
            // expect reserve api to be called with selected dates
            expect(reserveListing).toHaveBeenCalledWith('123', startDate, endDate, 2);
            // Expect the URL to be set correctly
            expect(navigateToPage).toHaveBeenCalledWith('https://checkout');
        });
    });
});
