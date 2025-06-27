import {App, FrontMatterCache} from "obsidian";
import {WorkoutTrackerSettings} from "@/types/Settings";
import {getSortedExercises} from "@/utils/getSortedExercises";

export function getLastParamValue(app: App, settings: WorkoutTrackerSettings, exercise: string, param: string): string | null {
    const sorted = getSortedExercises(app, settings, null, true);
    const exercises = (sorted[exercise] as FrontMatterCache[]) || [];
    const sortedByDate = exercises.sort((a, b) => {
        const aDate = new Date(a.date as string).getTime();
        const bDate = new Date(b.date as string).getTime();
        return bDate - aDate;
    });
    for (const ex of sortedByDate) {
        if (ex[param] !== undefined) {
            return String(ex[param]);
        }
    }
    return null;
}
