import React, { useState, useEffect, useCallback } from "react";
import "./index.css";
import Todo from "./components/Todo";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import Footer from "./components/Footer";

function App() {
	const [tasks, setTasks] = useState([]);
	const [filter, setFilter] = useState("All");
	const [isAllTasksDone, setIsAllTasksDone] = useState(false);

	const syncTasks = useCallback(
		() =>
			fetch("http://localhost:7000/tasks")
				.then((res) => res.json())
				.then((res) => setTasks(res)),
		[]
	);

	useEffect(() => {
		syncTasks();
	}, [syncTasks]);

	function deleteTask(id) {
		const remainingTasks = tasks.filter((task) => id !== task.id);
		setTasks(remainingTasks);
		fetch(`http://localhost:7000/tasks/${id}`, {
			method: "DELETE",
		}).then(() => console.log("deleted"));
	}

	function completeTask(id) {
		const updatedTasks = tasks.map((task) => {
			if (id === task.id) {
				fetch(`http://localhost:7000/tasks/${id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						id: task.id,
						name: task.name,
						isComplete: !task.isComplete,
					}),
				}).then(() => console.log("checked/unchecked"));
				return { ...task, isComplete: !task.isComplete };
			}
			return task;
		});
		setTasks(updatedTasks);
	}
	function completeAllTasks() {
		const isAllCompleted = tasks.every((task) => task.isComplete);
		const completedTasks = tasks.map((task) => ({
			...task,
			isComplete: !isAllCompleted,
		}));
		setTasks(completedTasks);
	}

	function clearCompletedTasks() {
		const clearedTasks = tasks.filter((task) => task.isComplete === false);
		setTasks(clearedTasks);
	}
	function filterTasks(task) {
		if (filter === "Completed") {
			return task.isComplete;
		}
		if (filter === "Active") {
			return !task.isComplete;
		}
		return true;
	}

	function editTask(id, newName) {
		fetch(`http://localhost:7000/tasks/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: newName,
			}),
		}).then(syncTasks);
	}

	useEffect(() => {
		const isAllCompleted = tasks.every((task) => task.isComplete);
		setIsAllTasksDone(isAllCompleted);
	}, [completeTask, completeAllTasks]);

	const counterTasks = tasks.length;
	const counterUncompletedTasks = tasks.filter(
		(task) => task.isComplete === false
	).length;

	return (
		<div className="app">
			<div className="content">
				<h1 className="header">todos</h1>
				<div className="wrapper">
					<Form
						setTasks={setTasks}
						completeAllTasks={completeAllTasks}
						isAllTasksDone={isAllTasksDone}
						counterTasks={counterTasks}
						tasks={tasks}
					/>
					<ul className="task-list">
						{tasks.filter(filterTasks).map((task) => (
							<Todo
								key={task.id}
								name={task.name}
								id={task.id}
								isComplete={task.isComplete}
								deleteTask={deleteTask}
								completeTask={completeTask}
								editTask={editTask}
							/>
						))}
					</ul>
					<FilterButton
						counterUncompletedTasks={counterUncompletedTasks}
						counterTasks={counterTasks}
						clearCompletedTasks={clearCompletedTasks}
						setFilter={setFilter}
						filter={filter}
					/>
				</div>
				<Footer />
			</div>
		</div>
	);
}

export default App;
