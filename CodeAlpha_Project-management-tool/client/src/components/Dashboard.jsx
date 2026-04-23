import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const loadProjects = () => {
    api.get('/projects').then(res => setProjects(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    try {
      await api.post('/projects', { title: newProjectTitle, description: newProjectDesc });
      setShowModal(false);
      setNewProjectTitle('');
      setNewProjectDesc('');
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '0.25rem'}}>My Projects</h1>
          <p style={{color: 'var(--text-secondary)'}}>Create boards to manage your tasks and collaborate in real-time.</p>
        </div>
        <button className="btn-primary" style={{display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '12px 24px', fontSize: '1rem'}} onClick={() => setShowModal(true)}>
          <Plus size={20} /> Create New Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.map(project => (
          <Link to={`/project/${project.id}`} key={project.id} className="project-card glass-panel" style={{position: 'relative'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)'}}>
                <FolderKanban size={24} />
              </div>
              <div>
                <h3 style={{fontSize: '1.25rem'}}>{project.title}</h3>
                <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-block', marginTop: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px'}}>
                  {project._count?.tasks || 0} tasks
                </span>
              </div>
            </div>
            {project.description && (
              <p style={{fontSize: '0.95rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '0.5rem'}}>
                {project.description}
              </p>
            )}
            <div style={{position: 'absolute', bottom: '1.5rem', right: '1.5rem', color: 'var(--accent-primary)', opacity: 0.5}} className="arrow-icon">
              →
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '6rem 2rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
            <div style={{width: '64px', height: '64px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'}}>
              <FolderKanban size={32} />
            </div>
            <h3 style={{fontSize: '1.5rem'}}>No projects yet</h3>
            <p style={{color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto'}}>
              Get started by creating your first project. You'll be able to add task columns, drag and drop cards, and collaborate.
            </p>
            <button className="btn-primary" style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem', padding: '12px 24px'}} onClick={() => setShowModal(true)}>
              <Plus size={20} /> Create Your First Project
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProject} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Project Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newProjectTitle} 
                  onChange={e => setNewProjectTitle(e.target.value)} 
                  autoFocus
                  required 
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Description (optional)</label>
                <textarea 
                  className="input-field" 
                  rows="3"
                  value={newProjectDesc} 
                  onChange={e => setNewProjectDesc(e.target.value)} 
                />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
