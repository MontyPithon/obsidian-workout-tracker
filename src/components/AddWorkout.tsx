import {useApp} from "@/hooks/useApp";
import {useState, useEffect} from "react";
import {WorkoutTrackerSettings} from "@/types/Settings";
import Select from 'react-select';
import {CircleX, ChevronUpCircle, ChevronDownCircle} from "lucide-react";
import {getArrayMoved} from "@/utils/arrayMove";
import {workoutToFile} from "@/utils/workoutToFile";
import {addWorkout} from "@/addWorkout/addWorkout";
import {getLastParamValue} from "@/utils/getLastParamValue";

export const AddWorkout = ({settings, context}: { settings?: WorkoutTrackerSettings, context: addWorkout }) => {
        const [isExerciseAdding, setExerciseAdding] = useState(false);
        const [date, setDate] = useState(new Date().toISOString().split('T')[0])
        const [workoutType, setWorkoutType] = useState(settings?.workoutTypes[0] || '')
        const [exercises, setExercises] = useState<{
                [key: string]: string
        }[]>([]);
        const [formValues, setFormValues] = useState<{ [key: string]: string }>({});
        const [paramSuggestions, setParamSuggestions] = useState<{[key: string]: string | null}>({});
        const app = useApp();

        useEffect(() => {
                if (!app || !settings || !formValues.selectedExercise) {
                        setParamSuggestions({});
                        return;
                }

                const result: {[key: string]: string | null} = {};
                settings.additionalExerciseParams.forEach(param => {
                        const value = getLastParamValue(app, settings, formValues.selectedExercise, param.name);
                        if (value) result[param.name] = value;
                });
                setParamSuggestions(result);
        }, [formValues.selectedExercise, app, settings]);

	function addExercise() {
		setExercises(prevExercises => [...prevExercises, formValues]);
	}

	const handleInputChange = (key: string, value: string) => {
		setFormValues(prevValues => ({
			...prevValues,
			[key]: value
		}));
	};

        async function saveWorkout() {
                if (!app || !settings?.workoutsFolder) return
                await workoutToFile(app, settings ,exercises, settings.workoutsFolder, date, workoutType);
                context.close()
        }

	return (
		<div className="flex-col gap-1">
			<h2>Adding workout</h2>
                        <input
                                type="date"
                                value={date}
                                onChange={(e) => {
                                        setDate(e.target.value)
                                }}
                        />
                        {settings?.workoutTypes && (
                                <select
                                        value={workoutType}
                                        onChange={(e) => setWorkoutType(e.target.value)}
                                >
                                        {settings.workoutTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                        ))}
                                </select>
                        )}
                        <button onClick={() => setExerciseAdding(true)}>Add exercise</button>

			{isExerciseAdding && (
				<div className={'add-exercise'}>
					<Select
						classNamePrefix={'custom-select'}
						options={settings?.exercises.map(exercise => ({value: exercise.name, label: exercise.name}))}
						onChange={(selectedOption) => handleInputChange('selectedExercise', selectedOption?.value || '')}
					/>
                                        {settings?.additionalExerciseParams.map((param, index) => (
                                                <div key={index} className={"flex gap-1 align-center justify-between"}>
                                                        <p>{param.name}</p>
                                                        <input
                                                                type="text"
                                                                placeholder={paramSuggestions[param.name] ? `Last: ${paramSuggestions[param.name]}` : ''}
                                                                value={formValues[param.name] || ''}
                                                                onChange={(e) => handleInputChange(param.name, e.target.value)}
                                                        />
                                                </div>
                                        ))}
					<div className={"flex gap-1 mt-1"}>
						<button onClick={() => setExerciseAdding(false)}>Cancel</button>
						<button onClick={() => {
							setExerciseAdding(false);
							addExercise();
						}}>Add
						</button>
					</div>
				</div>
			)}

			{exercises.map((exercise, index) => (
				<div key={index} className={"flex align-center justify-between"}>
					<p>{exercise.selectedExercise}</p>
					<div className={'flex align-center gap-1'}>
						<CircleX
							className={"pointer"}
							onClick={() => setExercises((prevValue) => prevValue.filter((_, i) => i !== index))}/>
						<ChevronUpCircle
							className={"pointer"}
							onClick={() => {
								setExercises(getArrayMoved(exercises, index, index - 1));
							}}/>
						<ChevronDownCircle
							className={"pointer"}
							onClick={() => {
								setExercises(getArrayMoved(exercises, index, index + 1));
							}}/>
					</div>

				</div>
			))}

			{exercises.length > 0 && (
				<button
					onClick={() => saveWorkout()}
				>Save workout</button>
			)}
		</div>
	);
};
