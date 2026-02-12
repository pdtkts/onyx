"use client";

/**
 * Theme Branding Section
 *
 * Manages the application identity settings: display name, logo upload,
 * and sidebar display style (logo+name, logo-only, name-only).
 * Layout uses a side-by-side arrangement with the logo picker on the right.
 */

import { FormField } from "@/refresh-components/form/FormField";
import InputTypeIn from "@/refresh-components/inputs/InputTypeIn";
import InputImage from "@/refresh-components/inputs/InputImage";
import Tabs from "@/refresh-components/Tabs";
import CharacterCount from "@/refresh-components/CharacterCount";
import Button from "@/refresh-components/buttons/Button";
import { SvgEdit } from "@opal/icons";
import { useFormikContext } from "formik";
import { useEffect, useMemo, useRef } from "react";
import { THEME_LOGO_URL } from "./theme-api";
import { DEFAULT_APP_NAME, type THEME_CHAR_LIMITS } from "./theme-types";
import type { PreviewHighlightTarget } from "./theme-preview";

interface ThemeBrandingSectionProps {
  selectedLogo: File | null;
  setSelectedLogo: (file: File | null) => void;
  charLimits: typeof THEME_CHAR_LIMITS;
  applicationNameInputRef: React.RefObject<HTMLInputElement | null>;
  bindPreviewRegion: (target: PreviewHighlightTarget) => Record<string, () => void>;
}

export function ThemeBrandingSection({
  selectedLogo,
  setSelectedLogo,
  charLimits,
  applicationNameInputRef,
  bindPreviewRegion,
}: ThemeBrandingSectionProps) {
  const { values, errors, setFieldValue } = useFormikContext<any>();
  const hiddenFileRef = useRef<HTMLInputElement>(null);

  // Build a stable object URL for the selected logo file
  const logoPreviewUrl = useMemo(() => {
    return selectedLogo ? URL.createObjectURL(selectedLogo) : null;
  }, [selectedLogo]);

  // Release blob URL on change or unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const resolveLogoSrc = (): string | undefined => {
    if (logoPreviewUrl) return logoPreviewUrl;
    if (values.use_custom_logo) return `${THEME_LOGO_URL}?u=${Date.now()}`;
    return undefined;
  };

  const logoAvailable = Boolean(selectedLogo || values.use_custom_logo);
  const nameAvailable = Boolean(values.application_name?.trim());

  // Reset display style when the current option becomes unavailable
  useEffect(() => {
    if (values.logo_display_style === "logo_only" && !logoAvailable) {
      setFieldValue("logo_display_style", "logo_and_name");
    } else if (values.logo_display_style === "name_only" && !nameAvailable) {
      setFieldValue("logo_display_style", "logo_and_name");
    }
  }, [logoAvailable, nameAvailable, values.logo_display_style, setFieldValue]);

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      setFieldValue("use_custom_logo", true);
    }
  };

  const triggerFilePicker = () => hiddenFileRef.current?.click();

  return (
    <>
      {/* Hidden file input for logo uploads */}
      <input
        type="file"
        ref={hiddenFileRef}
        onChange={onFileSelected}
        accept="image/png,image/jpeg,image/jpg"
        style={{ display: "none" }}
      />

      <div className="flex gap-10 items-center">
        {/* Logo picker (positioned first for visual emphasis) */}
        <FormField state="idle">
          <FormField.Label>Application Logo</FormField.Label>
          <FormField.Control>
            <InputImage
              src={resolveLogoSrc()}
              onEdit={triggerFilePicker}
              onDrop={(file) => {
                setSelectedLogo(file);
                setFieldValue("use_custom_logo", true);
              }}
              onRemove={() => {
                setFieldValue("use_custom_logo", false);
                setSelectedLogo(null);
              }}
              showEditOverlay={false}
            />
          </FormField.Control>
          <div className="mt-2 w-full flex justify-center items-center">
            <Button
              secondary
              disabled={!logoAvailable}
              onClick={triggerFilePicker}
              leftIcon={SvgEdit}
            >
              Update
            </Button>
          </div>
        </FormField>

        {/* Name and display style fields */}
        <div className="flex flex-col gap-4 w-full">
          <FormField state={errors.application_name ? "error" : "idle"}>
            <FormField.Label
              rightAction={
                <CharacterCount value={values.application_name} limit={charLimits.application_name} />
              }
            >
              Application Display Name
            </FormField.Label>
            <FormField.Control asChild>
              <InputTypeIn
                ref={applicationNameInputRef}
                data-label="theme-app-name"
                showClearButton
                variant={errors.application_name ? "error" : undefined}
                value={values.application_name}
                {...bindPreviewRegion("sidebar")}
                onChange={(e) => setFieldValue("application_name", e.target.value)}
              />
            </FormField.Control>
            <FormField.Description>
              Set a custom name that replaces the default &quot;{DEFAULT_APP_NAME}&quot; branding throughout the interface.
            </FormField.Description>
            <FormField.Message messages={{ error: errors.application_name as string }} />
          </FormField>

          <FormField state="idle">
            <FormField.Label>Logo Display Style</FormField.Label>
            <FormField.Control>
              <Tabs
                value={values.logo_display_style}
                onValueChange={(value) => setFieldValue("logo_display_style", value)}
              >
                <Tabs.List>
                  <Tabs.Trigger
                    value="logo_and_name"
                    tooltip="Display both the logo and application name together."
                    tooltipSide="top"
                    {...bindPreviewRegion("sidebar")}
                  >
                    Logo &amp; Name
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="logo_only"
                    disabled={!logoAvailable}
                    tooltip={logoAvailable ? "Display the logo without the name." : "A logo is required for this option."}
                    tooltipSide="top"
                    {...bindPreviewRegion("sidebar")}
                  >
                    Logo Only
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="name_only"
                    disabled={!nameAvailable}
                    tooltip={nameAvailable ? "Display the name without the logo." : "An application name is required for this option."}
                    tooltipSide="top"
                    {...bindPreviewRegion("sidebar")}
                  >
                    Name Only
                  </Tabs.Trigger>
                </Tabs.List>
              </Tabs>
            </FormField.Control>
            <FormField.Description>
              Controls the sidebar header appearance. Additional options unlock
              after providing a logo or application name above.
            </FormField.Description>
          </FormField>
        </div>
      </div>
    </>
  );
}
