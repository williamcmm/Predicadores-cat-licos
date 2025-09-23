import { getEmptySermon, normalizeSermon } from "@/models/sermonModel";

export const initSermon = (currentUser) => {
  if (!currentUser) {
    localStorage.removeItem("currentSermon");
    return getEmptySermon();
  }
  try {
    const savedSermon = localStorage.getItem("currentSermon");
    if (savedSermon) {
      const parsed = JSON.parse(savedSermon);
      if (parsed && typeof parsed === "object" && parsed.title !== undefined) {
        return normalizeSermon(parsed);
      }
    }
  } catch (error) {
    console.error("Error parsing sermon from localStorage:", error);
  }
  return getEmptySermon();
};
