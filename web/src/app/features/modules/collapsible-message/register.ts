/**
 * Side-effect module: registers CollapsibleText as the human message wrapper.
 * Imported by the features entry point to activate collapsible behavior.
 */
import { registerHumanMessageWrapper } from "@/app/features/chat-registry";
import { CollapsibleText } from "./collapsible-text";

registerHumanMessageWrapper(CollapsibleText);
