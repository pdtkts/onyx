"use client";

import React, { useCallback } from "react";
import * as Yup from "yup";
import { FormikField } from "@/refresh-components/form/FormikField";
import { FormField } from "@/refresh-components/form/FormField";
import PasswordInputTypeIn from "@/refresh-components/inputs/PasswordInputTypeIn";
import { ImageGenFormWrapper } from "@/app/admin/configuration/image-generation/forms/ImageGenFormWrapper";
import {
  ImageGenFormBaseProps,
  ImageGenFormChildProps,
  ImageGenSubmitPayload,
} from "@/app/admin/configuration/image-generation/forms/types";
import { ImageGenerationCredentials } from "@/lib/configuration/imageConfigurationService";
import { CookieJsonParser } from "./cookie-json-parser";

// Derive type from props to avoid circular import with constants.ts
// (constants.ts → image-gen-registry.ts → index.ts → this file → constants.ts)
type ImageProvider = ImageGenFormBaseProps["imageProvider"];

const GEMINI_WEB_PROVIDER_NAME = "gemini_web";

/** Form values — two cookie fields stored in customConfig */
interface GeminiWebFormValues {
  secure_1psid: string;
  secure_1psidts: string;
}

const initialValues: GeminiWebFormValues = {
  secure_1psid: "",
  secure_1psidts: "",
};

const validationSchema = Yup.object().shape({
  secure_1psid: Yup.string().required("__Secure-1PSID cookie is required"),
  secure_1psidts: Yup.string().required("__Secure-1PSIDTS cookie is required"),
});

function GeminiWebFormFields(
  props: ImageGenFormChildProps<GeminiWebFormValues>
) {
  const {
    formikProps,
    apiStatus,
    showApiMessage,
    errorMessage,
    disabled,
    imageProvider,
    resetApiState,
  } = props;

  /** Auto-fill both cookie fields when JSON parser extracts values.
   * Use formikProps.setFieldValue directly (stable ref from Formik) to avoid
   * re-creating callback on every render since formikProps object changes each render. */
  const { setFieldValue } = formikProps;
  const handleCookiesExtracted = useCallback(
    (cookies: { secure_1psid: string; secure_1psidts: string }) => {
      setFieldValue("secure_1psid", cookies.secure_1psid);
      setFieldValue("secure_1psidts", cookies.secure_1psidts);
      resetApiState();
    },
    [setFieldValue, resetApiState]
  );

  return (
    <>
      {/* Quick import — paste full cookie JSON to auto-extract values */}
      <CookieJsonParser
        onCookiesExtracted={handleCookiesExtracted}
        disabled={disabled}
      />

      {/* Divider between parser and manual fields */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-text-subtle">or fill manually</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* __Secure-1PSID cookie field */}
      <FormikField<string>
        name="secure_1psid"
        render={(field, helper, meta, state) => (
          <FormField
            name="secure_1psid"
            state={apiStatus === "error" ? "error" : state}
            className="w-full"
          >
            <FormField.Label>__Secure-1PSID</FormField.Label>
            <FormField.Control>
              <PasswordInputTypeIn
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  resetApiState();
                }}
                placeholder="Paste your __Secure-1PSID cookie value"
                showClearButton={false}
                disabled={disabled}
                error={apiStatus === "error"}
              />
            </FormField.Control>
            {showApiMessage ? (
              <FormField.APIMessage
                state={apiStatus}
                messages={{
                  loading: `Testing cookies with ${imageProvider.title}...`,
                  success: "Cookies valid. Configuration saved.",
                  error: errorMessage || "Invalid cookies",
                }}
              />
            ) : (
              <FormField.Message
                messages={{
                  idle: "From browser DevTools → Application → Cookies → gemini.google.com",
                  error: meta.error,
                }}
              />
            )}
          </FormField>
        )}
      />

      {/* __Secure-1PSIDTS cookie field */}
      <FormikField<string>
        name="secure_1psidts"
        render={(field, helper, meta, state) => (
          <FormField
            name="secure_1psidts"
            state={state}
            className="w-full"
          >
            <FormField.Label>__Secure-1PSIDTS</FormField.Label>
            <FormField.Control>
              <PasswordInputTypeIn
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  resetApiState();
                }}
                placeholder="Paste your __Secure-1PSIDTS cookie value"
                showClearButton={false}
                disabled={disabled}
                error={false}
              />
            </FormField.Control>
            <FormField.Message
              messages={{
                idle: "From the same cookie store. This cookie auto-refreshes after connection.",
                error: meta.error,
              }}
            />
          </FormField>
        )}
      />
    </>
  );
}

function getInitialValuesFromCredentials(
  credentials: ImageGenerationCredentials,
  _imageProvider: ImageProvider
): Partial<GeminiWebFormValues> {
  return {
    secure_1psid: credentials.custom_config?.secure_1psid || "",
    secure_1psidts: credentials.custom_config?.secure_1psidts || "",
  };
}

function transformValues(
  values: GeminiWebFormValues,
  imageProvider: ImageProvider
): ImageGenSubmitPayload {
  return {
    modelName: imageProvider.model_name,
    imageProviderId: imageProvider.image_provider_id,
    provider: GEMINI_WEB_PROVIDER_NAME,
    customConfig: {
      secure_1psid: values.secure_1psid,
      secure_1psidts: values.secure_1psidts,
    },
  };
}

export function GeminiWebImageGenForm(props: ImageGenFormBaseProps) {
  const { imageProvider, existingConfig } = props;

  return (
    <ImageGenFormWrapper<GeminiWebFormValues>
      {...props}
      title={
        existingConfig
          ? `Edit ${imageProvider.title}`
          : `Connect ${imageProvider.title}`
      }
      description={imageProvider.description}
      initialValues={initialValues}
      validationSchema={validationSchema}
      getInitialValuesFromCredentials={getInitialValuesFromCredentials}
      transformValues={(values) => transformValues(values, imageProvider)}
    >
      {(childProps) => <GeminiWebFormFields {...childProps} />}
    </ImageGenFormWrapper>
  );
}
