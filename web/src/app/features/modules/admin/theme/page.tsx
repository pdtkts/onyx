"use client";

import * as SettingsLayouts from "@/layouts/settings-layouts";
import { SvgPaintBrush } from "@opal/icons";
import Button from "@/refresh-components/buttons/Button";
import { useContext, useRef, useState } from "react";
import { SettingsContext } from "@/providers/SettingsProvider";
import { usePopup } from "@/components/admin/connectors/Popup";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { EnterpriseSettings } from "@/app/admin/settings/interfaces";
import { THEME_CHAR_LIMITS } from "./theme-types";
import { updateThemeSettings, uploadThemeLogo } from "./theme-api";
import { ThemeSettingsForm, type ThemeSettingsFormRef } from "./theme-settings-form";

/**
 * Build a nullable Yup string field with a max-length constraint
 * derived from the THEME_CHAR_LIMITS config object.
 */
function charLimitedString(field: keyof typeof THEME_CHAR_LIMITS) {
  const limit = THEME_CHAR_LIMITS[field];
  return Yup.string().max(limit, `Maximum ${limit} characters`).nullable();
}

/**
 * Wraps a char-limited string with a conditional requirement:
 * required when `toggleField` is true, nullable otherwise.
 */
function conditionallyRequired(
  field: keyof typeof THEME_CHAR_LIMITS,
  toggleField: string,
  requiredMessage: string
) {
  return charLimitedString(field).when(toggleField, {
    is: true,
    then: (schema) => schema.required(requiredMessage),
    otherwise: (schema) => schema.nullable(),
  });
}

// Programmatically generated from THEME_CHAR_LIMITS instead of manual field-by-field definition
const validationSchema = Yup.object().shape({
  // Branding fields
  application_name: charLimitedString("application_name").trim(),
  logo_display_style: Yup.string().oneOf(["logo_and_name", "logo_only", "name_only"]).required(),
  use_custom_logo: Yup.boolean().required(),

  // Chat text fields
  custom_greeting_message: charLimitedString("custom_greeting_message"),
  custom_header_content: charLimitedString("custom_header_content"),
  custom_lower_disclaimer_content: charLimitedString("custom_lower_disclaimer_content"),

  // Notice fields - conditionally required based on toggle state
  show_first_visit_notice: Yup.boolean().nullable(),
  custom_popup_header: conditionallyRequired("custom_popup_header", "show_first_visit_notice", "Notice Header is required"),
  custom_popup_content: conditionallyRequired("custom_popup_content", "show_first_visit_notice", "Notice Content is required"),

  // Consent fields - conditionally required based on consent toggle
  enable_consent_screen: Yup.boolean().nullable(),
  consent_screen_prompt: conditionallyRequired("consent_screen_prompt", "enable_consent_screen", "Notice Consent Prompt is required"),
});

export default function ThemePage() {
  const router = useRouter();
  const settings = useContext(SettingsContext);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const formRef = useRef<ThemeSettingsFormRef>(null);
  const { popup, setPopup } = usePopup();

  if (!settings) return null;

  const enterpriseSettings = settings.enterpriseSettings;

  return (
    <Formik
      initialValues={{
        application_name: enterpriseSettings?.application_name ?? "",
        logo_display_style: enterpriseSettings?.logo_display_style ?? "logo_and_name",
        use_custom_logo: enterpriseSettings?.use_custom_logo ?? false,
        custom_greeting_message: enterpriseSettings?.custom_greeting_message ?? "",
        custom_header_content: enterpriseSettings?.custom_header_content ?? "",
        custom_lower_disclaimer_content: enterpriseSettings?.custom_lower_disclaimer_content ?? "",
        show_first_visit_notice: enterpriseSettings?.show_first_visit_notice ?? false,
        custom_popup_header: enterpriseSettings?.custom_popup_header ?? "",
        custom_popup_content: enterpriseSettings?.custom_popup_content ?? "",
        enable_consent_screen: enterpriseSettings?.enable_consent_screen ?? false,
        consent_screen_prompt: enterpriseSettings?.consent_screen_prompt ?? "",
      }}
      validationSchema={validationSchema}
      validateOnChange={false}
      onSubmit={async (values, formikHelpers) => {
        try {
          if (selectedLogo) {
            await uploadThemeLogo(selectedLogo);
            setSelectedLogo(null);
            formikHelpers.setFieldValue("use_custom_logo", true);
          }

          // Merge with existing settings to preserve hidden fields
          const merged: EnterpriseSettings = {
            ...(enterpriseSettings || {}),
            application_name: values.application_name || null,
            use_custom_logo: values.use_custom_logo,
            use_custom_logotype: enterpriseSettings?.use_custom_logotype || false,
            logo_display_style: values.logo_display_style || null,
            custom_nav_items: enterpriseSettings?.custom_nav_items || [],
            custom_greeting_message: values.custom_greeting_message || null,
            custom_header_content: values.custom_header_content || null,
            custom_lower_disclaimer_content: values.custom_lower_disclaimer_content || null,
            two_lines_for_chat_header: enterpriseSettings?.two_lines_for_chat_header || null,
            custom_popup_header: values.custom_popup_header || null,
            custom_popup_content: values.custom_popup_content || null,
            show_first_visit_notice: values.show_first_visit_notice || null,
            enable_consent_screen: values.enable_consent_screen || null,
            consent_screen_prompt: values.consent_screen_prompt || null,
          };

          await updateThemeSettings(merged);
          router.refresh();
          formikHelpers.resetForm({ values });
          setPopup({ type: "success", message: "Appearance settings saved successfully!" });
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Unknown error";
          setPopup({ type: "error", message: `Failed to save settings: ${msg}` });
        } finally {
          formikHelpers.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, dirty, validateForm, setErrors, submitForm }) => {
        const hasLogoChange = !!selectedLogo;
        return (
          <Form className="w-full h-full">
            {popup}
            <SettingsLayouts.Root>
              <SettingsLayouts.Header
                title="Appearance & Theming"
                description="Customize how the application appears to users across your organization."
                icon={SvgPaintBrush}
                rightChildren={
                  <Button
                    type="button"
                    disabled={isSubmitting || (!dirty && !hasLogoChange)}
                    onClick={async () => {
                      const errors = await validateForm();
                      if (Object.keys(errors).length > 0) {
                        setErrors(errors);
                        formRef.current?.focusFirstError(errors);
                        return;
                      }
                      await submitForm();
                    }}
                  >
                    {isSubmitting ? "Applying..." : "Apply Changes"}
                  </Button>
                }
              />
              <SettingsLayouts.Body>
                <ThemeSettingsForm
                  ref={formRef}
                  selectedLogo={selectedLogo}
                  setSelectedLogo={setSelectedLogo}
                />
              </SettingsLayouts.Body>
            </SettingsLayouts.Root>
          </Form>
        );
      }}
    </Formik>
  );
}
