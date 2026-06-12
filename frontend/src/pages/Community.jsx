import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { communityAPI } from '../services/api';

const Community = () => {
  const { t } = useLanguage();

  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCat, setNewCat] = useState('recipe');
  
  // Comments state maps postId -> comments list
  const [commentsMap, setCommentsMap] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await communityAPI.getPosts(selectedCategory);
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching forum posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      setError('Please fill in both title and content.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await communityAPI.createPost({
        title: newTitle,
        content: newContent,
        category: newCat
      });
      setNewTitle('');
      setNewContent('');
      fetchPosts();
    } catch (err) {
      setError('Failed to publish post.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await communityAPI.likePost(postId);
      // Refresh posts list to see updated like counts
      fetchPosts();
    } catch (err) {
      console.error('Like request failed', err);
    }
  };

  const toggleComments = async (postId) => {
    if (expandedComments[postId]) {
      setExpandedComments(prev => ({ ...prev, [postId]: false }));
    } else {
      setExpandedComments(prev => ({ ...prev, [postId]: true }));
      try {
        const res = await communityAPI.getComments(postId);
        setCommentsMap(prev => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        console.error('Could not fetch comments', err);
      }
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const content = commentInputs[postId] || '';
    if (!content.trim()) return;

    try {
      await communityAPI.createComment(postId, content);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      // Refresh comments
      const res = await communityAPI.getComments(postId);
      setCommentsMap(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error('Comment failed', err);
    }
  };

  return (
    <div>
      <div className="app-header">
        <div>
          <h2>💬 {t('forumTitle')}</h2>
          <p style={{ fontSize: '0.9rem' }}>Discuss dietary tips, share healthy recipes, and talk with other members.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left: Feed and Posts list */}
        <div>
          {/* Filter Bar */}
          <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>Category:</span>
              <button className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCategory('')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                All
              </button>
              <button className={`btn ${selectedCategory === 'recipe' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCategory('recipe')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                Recipes
              </button>
              <button className={`btn ${selectedCategory === 'tip' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCategory('tip')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                Tips
              </button>
              <button className={`btn ${selectedCategory === 'motivation' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCategory('motivation')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                Motivation
              </button>
              <button className={`btn ${selectedCategory === 'question' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCategory('question')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                Questions
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading feed... 📡</div>
          ) : posts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {posts.map((post) => (
                <div key={post.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      padding: '4px 8px',
                      background: 'rgba(16,185,129,0.1)',
                      color: 'var(--accent)',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Published by {post.author_username} on {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ marginBottom: '12px' }}>{post.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', whiteSpace: 'pre-line' }}>
                    {post.content}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handleLike(post.id)}>
                      👍 Like ({post.likes_count || 0})
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => toggleComments(post.id)}>
                      💬 Comments ({post.comments_count || 0})
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[post.id] && (
                    <div style={{ marginTop: '16px', padding: '16px 0 0', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {commentsMap[post.id]?.map((comment) => (
                          <div key={comment.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
                              <span>{comment.author_username}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)' }}>{comment.content}</p>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={(e) => handleCommentSubmit(e, post.id)} style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={t('writeComment')}
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                          Comment
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>No posts found in this category.</p>
          )}
        </div>

        {/* Right: Publish Post Form */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <h3>⚡ {t('createPost')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Broadcast nutritional ideas or ask questions.
          </p>

          {error && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>}

          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label className="form-label">{t('postTitle')}</label>
              <input
                type="text"
                className="form-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. My Favorite Keto Salad Recipe"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('postCategory')}</label>
              <select className="form-select" value={newCat} onChange={(e) => setNewCat(e.target.value)}>
                <option value="recipe">Recipe</option>
                <option value="tip">Health Tip</option>
                <option value="motivation">Motivation</option>
                <option value="question">Question</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Content</label>
              <textarea
                className="form-textarea"
                rows="5"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={t('postContent')}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Publishing...' : t('postBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Community;
