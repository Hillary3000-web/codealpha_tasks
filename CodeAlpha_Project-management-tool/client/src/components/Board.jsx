import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MessageSquare, ArrowLeft, GripHorizontal, Layout } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../api';
import { useAuth } from '../App';

export default function Board() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Task viewing modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const loadProject = () => {
    api.get(`/projects/${id}`).then(res => {
      setProject(res.data);
      setColumns(res.data.columns);
    }).catch(console.error);
  };

  useEffect(() => {
    loadProject();
    
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    const newSocket = io(SOCKET_URL);
    newSocket.emit('join-project', id);
    newSocket.on('board-updated', () => {
      loadProject();
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [id]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI Update
    const sourceColIndex = columns.findIndex(c => c.id === source.droppableId);
    const destColIndex = columns.findIndex(c => c.id === destination.droppableId);
    
    const newColumns = Array.from(columns);
    const sourceTasks = Array.from(newColumns[sourceColIndex].tasks);
    const destTasks = source.droppableId === destination.droppableId ? sourceTasks : Array.from(newColumns[destColIndex].tasks);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, movedTask);

    newColumns[sourceColIndex].tasks = sourceTasks;
    if (source.droppableId !== destination.droppableId) {
      newColumns[destColIndex].tasks = destTasks;
    }
    setColumns(newColumns);

    // Persist
    try {
      await api.put('/tasks/move', {
        taskId: draggableId,
        newColumnId: destination.droppableId,
        newOrder: destination.index,
        projectId: id,
        columnTasks: destTasks
      });
    } catch (err) {
      console.error('Failed to move task, reverting state');
      loadProject(); // Revert on fail
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        columnId: activeColumnId,
        projectId: id
      });
      setShowTaskModal(false);
      setNewTaskTitle('');
      // Socket will trigger loadProject
    } catch (err) {
      console.error(err);
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tasks/${selectedTask.id}/comments`, {
        content: newComment,
        projectId: id
      });
      setNewComment('');
      loadProject();
      setSelectedTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) return <div style={{padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)'}}>Loading your project board...</div>;

  return (
    <div className="board-container animate-fade-in" style={{flexDirection: 'column', paddingTop: '1.5rem'}}>
      <div style={{marginBottom: '1.5rem', paddingLeft: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem'}}>
        <Link to="/" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 500, fontSize: '0.9rem'}}>
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
          <Layout size={28} color="var(--accent-primary)" />
          <h1 style={{fontSize: '2rem', margin: 0}}>{project.title}</h1>
        </div>
        {project.description && <p style={{color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem'}}>{project.description}</p>}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{display: 'flex', gap: '1.5rem', flex: 1, overflowX: 'auto', width: '100%', alignItems: 'flex-start', paddingBottom: '2rem'}}>
          {columns.map(column => (
            <div key={column.id} className="kanban-column" style={{boxShadow: 'var(--shadow-md)'}}>
              <div className="column-header" style={{background: 'rgba(0,0,0,0.2)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px'}}>
                <span style={{fontWeight: 600, fontSize: '1rem', letterSpacing: '0.5px'}}>{column.title.toUpperCase()}</span>
                <span style={{fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px'}}>
                  {column.tasks.length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div 
                    className="tasks-container"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: '200px', 
                      background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    {column.tasks.length === 0 && !snapshot.isDraggingOver && (
                      <div style={{padding: '2rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '8px', margin: '0.5rem 0'}}>
                        Drop tasks here
                      </div>
                    )}
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task-card"
                            onClick={() => openTaskModal(task)}
                            style={{
                              ...provided.draggableProps.style,
                              borderColor: snapshot.isDragging ? 'var(--accent-primary)' : 'var(--glass-border)',
                              transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} scale(1.02)` : provided.draggableProps.style?.transform,
                              zIndex: snapshot.isDragging ? 100 : 1,
                            }}
                          >
                            <div className="task-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem'}}>
                              <span style={{lineHeight: 1.4}}>{task.title}</span>
                              <GripHorizontal size={16} style={{opacity: 0.3, flexShrink: 0, marginTop: '2px'}} />
                            </div>
                            {task.description && <div className="task-desc">{task.description}</div>}
                            
                            <div className="task-footer">
                              <span style={{opacity: 0.5, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px'}}>Task #{index+1}</span>
                              {task.comments?.length > 0 && (
                                <div className="comment-count" style={{color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: '4px'}}>
                                  <MessageSquare size={14} /> {task.comments.length}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div style={{padding: '0.75rem', borderTop: '1px solid var(--glass-border)'}}>
                <button 
                  className="btn-secondary" 
                  style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'rgba(255,255,255,0.02)'}}
                  onClick={() => { setActiveColumnId(column.id); setShowTaskModal(true); }}
                >
                  <Plus size={16} /> Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTask} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Task Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newTaskTitle} 
                  onChange={e => setNewTaskTitle(e.target.value)} 
                  autoFocus
                  required 
                />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{marginBottom: '0.5rem'}}>
              <h2>{selectedTask.title}</h2>
              <button className="modal-close" onClick={() => setSelectedTask(null)}>✕</button>
            </div>
            {selectedTask.description && (
              <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem'}}>{selectedTask.description}</p>
            )}

            <div style={{marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem'}}>
              <h4>Comments & Activity</h4>
              <div style={{marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto'}}>
                {selectedTask.comments?.map(comment => (
                  <div key={comment.id} style={{padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.9rem'}}>
                    <div style={{fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.25rem', fontSize: '0.8rem'}}>{comment.author?.name || 'User'}</div>
                    <div>{comment.content}</div>
                  </div>
                ))}
                {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                  <div style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>No comments yet.</div>
                )}
              </div>
              
              <form onSubmit={handleAddComment} style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Write a comment..." 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn-primary">Post</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
