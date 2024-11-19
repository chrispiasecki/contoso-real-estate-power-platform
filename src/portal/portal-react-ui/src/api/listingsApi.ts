// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ApiError, ApiErrorCodes } from './apiErrors';
import { invokeFlow, retrieveMultiple } from './webApi';
import { ListingData } from '../model/listings';
import { setMetadataCache } from 'dataverse-ify';
import { metadataCache } from '../dataverse-gen/metadata';
import {
    contoso_listing,
    contoso_ListingImage,
    contoso_listingimageMetadata,
    contoso_listingMetadata,
} from '../dataverse-gen';

export async function reserveListing(
    listingID: string,
    from: Date,
    to: Date,
    guests: number,
): Promise<{ sessionUrl: string }> {
    const parameters = {
        operation: 'checkout',
        listingID,
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
        guests,
        reservationId: '',
    };

    try {
        const responseData = await invokeFlow<{ sessionurl: string; errormessage: string }>(
            window.CRE_SETTING_CHECKOUT_FLOW_URL,
            parameters,
        );

        if (responseData.errormessage && responseData.errormessage.length > 0) {
            throw new ApiError(responseData.errormessage, ApiErrorCodes.API_CHECKOUT_ERROR);
        }
        return { sessionUrl: responseData.sessionurl };
    } catch (error) {
        if (error instanceof TypeError) {
            console.error('Error in checkout', error);
            throw new ApiError(error.message, ApiErrorCodes.NETWORK_ERROR);
        }
        throw error;
    }
}

export async function completeReservation(reservationId: string): Promise<void> {
    const parameters = {
        operation: 'complete',
        listingID: '',
        from: '',
        to: '',
        guests: 0,
        reservationId,
    };

    try {
        const responseData = await invokeFlow<{ errormessage: string }>(
            window.CRE_SETTING_CHECKOUT_FLOW_URL,
            parameters,
        );

        if (responseData.errormessage && responseData.errormessage.length > 0) {
            throw new ApiError(responseData.errormessage, ApiErrorCodes.API_CHECKOUT_ERROR);
        }
    } catch (error) {
        if (error instanceof TypeError) {
            console.error('Error in checkout', error);
            throw new ApiError(error.message, ApiErrorCodes.NETWORK_ERROR);
        }
        throw error;
    }
}

export async function getListings() {
    const fetch = `<fetch version="1.0" mapping="logical"
  no-lock="true" distinct="true">
  <entity name="contoso_listing">
      <attribute name="contoso_listingid" />
      <attribute name="contoso_image_url" />
      <attribute name="contoso_name" />
      <attribute name="contoso_address" />
      <attribute name="contoso_pricepermonth" />
      <attribute name="contoso_features" />
      <attribute name="contoso_displayname" />
      <attribute name="contoso_description" />
      <attribute name="contoso_primaryimage" />
      <filter type="and">
          <condition attribute="statecode" operator="eq" value="0" />
      </filter>
      <order attribute="contoso_name" descending="false" />
  </entity>
</fetch>`;

    setMetadataCache(metadataCache);

    const records = await retrieveMultiple<contoso_listing>(
        contoso_listingMetadata.collectionName,
        contoso_listingMetadata.logicalName,
        fetch,
    );
    return records.entities;
}

export async function getListing(listingId: string): Promise<ListingData> {
    const listingFetch = `<fetch version="1.0" mapping="logical"
  no-lock="true" distinct="true">
  <entity name="contoso_listing">
      <attribute name="contoso_listingid" />
      <attribute name="contoso_listingid1" />
      <attribute name="contoso_image_url" />
      <attribute name="contoso_name" />
      <attribute name="contoso_address" />
      <attribute name="contoso_pricepermonth" />
      <attribute name="contoso_features" />
      <attribute name="contoso_displayname" />
      <attribute name="contoso_description" />
      <attribute name="contoso_primaryimage" />
      <filter type="and">
      <condition attribute="contoso_listingid" operator="eq" value="${listingId}" />
      </filter>
      <order attribute="contoso_name" descending="false" />
  </entity>
</fetch>`;
    const imagesFetch = `<fetch version="1.0" mapping="logical"
no-lock="true" distinct="true">
<entity name="contoso_listingimage">
<attribute name="contoso_listingimageid" />
<attribute name="contoso_name" />
<filter>
  <condition attribute="contoso_listing" operator="eq" value="${listingId}" />
</filter>
</entity>
</fetch>`;

    setMetadataCache(metadataCache);

    const [listing, images] = await Promise.all([
        retrieveMultiple<contoso_listing>(
            contoso_listingMetadata.collectionName,
            contoso_listingMetadata.logicalName,
            listingFetch,
        ),
        retrieveMultiple<contoso_ListingImage>(
            contoso_listingimageMetadata.collectionName,
            contoso_listingimageMetadata.logicalName,
            imagesFetch,
        ),
    ]);

    return { listing: listing.entities[0], images: images.entities };
}