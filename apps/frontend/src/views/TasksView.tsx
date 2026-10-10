import React, { useEffect, useState } from 'react';
import { Check, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import type { Task, TaskPriority, TaskStatus } from '../types';
import { apiRequest } from '../api/client';
import { Modal } from '../components/Modal';

export const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [category, setCategory] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await apiRequest<Task[]>('/tasks');
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest<Task>('/tasks', {
        method: 'POST',
        body: {
          title,
          description: description || undefined,
          priority,
          category: category || undefined,
          isDaily,
        },
      });

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setCategory('');
      setIsDaily(false);
      fetchTasks();
    } catch (err) {
      alert('Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus: TaskStatus =
      task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';

    try {
      await apiRequest<Task>(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
      );
    } catch (err) {
      alert('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert('Failed to delete task.');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Actions */}
      <div style={styles.topBar}>
        <div style={styles.tabFilters}>
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                ...styles.filterBtn,
                ...(filterStatus === st ? styles.activeFilterBtn : {}),
              }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button onClick={() => setIsModalOpen(true)} className="gradient-btn">
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div style={{ color: '#94a3b8' }}>Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card" style={styles.emptyState}>
          <CheckCircle2 size={48} color="#6366f1" style={{ marginBottom: '12px' }} />
          <h3>No Tasks Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Get started by creating your first developer task!
          </p>
        </div>
      ) : (
        <div style={styles.taskList}>
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className="glass-card"
                style={{
                  ...styles.taskCard,
                  opacity: isCompleted ? 0.65 : 1,
                }}
              >
                <button
                  onClick={() => handleToggleStatus(task)}
                  style={{
                    ...styles.checkbox,
                    backgroundColor: isCompleted
                      ? '#10b981'
                      : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                  }}
                  title={isCompleted ? 'Mark Todo' : 'Mark Completed'}
                >
                  {isCompleted && <Check size={14} color="#ffffff" />}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span
                      style={{
                        ...styles.taskTitle,
                        textDecoration: isCompleted ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    {task.isDaily && (
                      <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
                        Daily Task
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p style={styles.taskDesc}>{task.description}</p>
                  )}
                  {task.category && (
                    <span style={styles.categoryTag}>#{task.category}</span>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={styles.deleteBtn}
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={styles.modalLabel}>Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement JwtAuthGuard in NestJS"
              className="glass-input"
            />
          </div>

          <div>
            <label style={styles.modalLabel}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add implementation notes or steps..."
              className="glass-input"
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={styles.modalLabel}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="glass-input"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label style={styles.modalLabel}>Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Backend, Frontend, DevOps"
                className="glass-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="isDaily"
              checked={isDaily}
              onChange={(e) => setIsDaily(e.target.checked)}
            />
            <label htmlFor="isDaily" style={{ fontSize: '0.88rem', color: '#cbd5e1', cursor: 'pointer' }}>
              Repeat as Daily Recurring Task
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-btn"
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Creating Task...' : 'Create Task'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabFilters: {
    display: 'flex',
    gap: '6px',
    backgroundColor: 'rgba(18, 25, 41, 0.75)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  filterBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeFilterBtn: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    fontWeight: 600,
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  taskCard: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  taskTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#f8fafc',
  },
  taskDesc: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  categoryTag: {
    fontSize: '0.75rem',
    color: '#6366f1',
    marginTop: '4px',
    display: 'inline-block',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'color 0.2s ease',
  },
  emptyState: {
    padding: '60px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: '6px',
    display: 'block',
  },
};
