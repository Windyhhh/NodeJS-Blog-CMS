// 主要JavaScript功能

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化工具提示
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // 初始化弹出框
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // 自动隐藏警告消息
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // 搜索表单增强
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        const searchInput = searchForm.querySelector('input[name="search"]');
        if (searchInput) {
            // 搜索建议功能（可以后续扩展）
            searchInput.addEventListener('input', debounce(function(e) {
                // 这里可以添加搜索建议功能
            }, 300));
        }
    }

    // 帖子操作功能
    initPostActions();
    
    // 表单验证增强
    initFormValidation();
    
    // 图片懒加载
    initLazyLoading();
});

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始化帖子操作
function initPostActions() {
    // 删除帖子确认
    const deleteButtons = document.querySelectorAll('.delete-post-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.dataset.postId;
            const postTitle = this.dataset.postTitle;
            
            if (confirm(`确定要删除帖子"${postTitle}"吗？此操作不可撤销。`)) {
                deletePost(postId);
            }
        });
    });

    // 点赞功能
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.dataset.postId;
            toggleLike(postId, this);
        });
    });

    // 收藏功能
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.dataset.postId;
            toggleFavorite(postId, this);
        });
    });
}

// 删除帖子
function deletePost(postId) {
    fetch(`/posts/${postId}/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 删除成功，重定向到帖子列表
            window.location.href = '/posts';
        } else {
            alert('删除失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('删除帖子错误:', error);
        alert('删除失败，请稍后重试');
    });
}

// 切换点赞状态
function toggleLike(postId, button) {
    const isLiked = button.classList.contains('liked');
    const action = isLiked ? 'unlike' : 'like';
    
    fetch(`/posts/${postId}/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            button.classList.toggle('liked');
            const icon = button.querySelector('i');
            const countSpan = button.querySelector('.like-count');
            
            if (isLiked) {
                icon.classList.remove('fas');
                icon.classList.add('far');
                countSpan.textContent = parseInt(countSpan.textContent) - 1;
            } else {
                icon.classList.remove('far');
                icon.classList.add('fas');
                countSpan.textContent = parseInt(countSpan.textContent) + 1;
            }
        } else {
            alert('操作失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('点赞操作错误:', error);
        alert('操作失败，请稍后重试');
    });
}

// 切换收藏状态
function toggleFavorite(postId, button) {
    const isFavorited = button.classList.contains('favorited');
    const action = isFavorited ? 'unfavorite' : 'favorite';
    
    fetch(`/posts/${postId}/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            button.classList.toggle('favorited');
            const icon = button.querySelector('i');
            
            if (isFavorited) {
                icon.classList.remove('fas');
                icon.classList.add('far');
                button.title = '收藏';
            } else {
                icon.classList.remove('far');
                icon.classList.add('fas');
                button.title = '取消收藏';
            }
        } else {
            alert('操作失败：' + data.message);
        }
    })
    .catch(error => {
        console.error('收藏操作错误:', error);
        alert('操作失败，请稍后重试');
    });
}

// 初始化表单验证
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // 实时验证
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    });
}

// 初始化图片懒加载
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // 降级处理
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// 格式化时间
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    
    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前';
    } else if (diff < week) {
        return Math.floor(diff / day) + '天前';
    } else if (diff < month) {
        return Math.floor(diff / week) + '周前';
    } else if (diff < year) {
        return Math.floor(diff / month) + '个月前';
    } else {
        return Math.floor(diff / year) + '年前';
    }
}

// 显示加载状态
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<span class="loading"></span> 加载中...';
    element.disabled = true;
    
    return function hideLoading() {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// 显示成功消息
function showSuccess(message) {
    showMessage(message, 'success');
}

// 显示错误消息
function showError(message) {
    showMessage(message, 'danger');
}

// 显示消息
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // 自动隐藏
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
}
