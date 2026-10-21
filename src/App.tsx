import { FormEvent, useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { getComments, getPost, getPosts } from "./api";
import type { Comment, Post } from "./types";

const STORAGE_POSTS = "miniblog-posts";
const STORAGE_AUTH = "miniblog-auth";
const localPosts = (): Post[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_POSTS) || "[]");
  } catch {
    return [];
  }
};

function Header({
  loggedIn,
  onLogout,
}: {
  loggedIn: boolean;
  onLogout: () => void;
}) {
  return (
    <header>
      <Link className="brand" to="/">
        Mini<span>Blog</span>
      </Link>
      <nav>
        <Link to="/">Trang chủ</Link>
        {loggedIn ? (
          <>
            <Link to="/write">Viết bài</Link>
            <button className="link-button" onClick={onLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <Link className="login-link" to="/login">
            Đăng nhập
          </Link>
        )}
      </nav>
    </header>
  );
}

function Home() {
  const nav = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    getPosts()
      .then((data) => setPosts([...localPosts(), ...data]))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const visible = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p>TẠP CHÍ CỦA NHỮNG Ý TƯỞNG NHỎ</p>
          <h1>
            Đọc chậm,
            <br />
            nghĩ <em>sâu.</em>
          </h1>
          <div className="hero-note">Một góc nhỏ dành cho những câu chuyện đáng được lắng nghe.</div>
        </div>
        <label className="search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết theo tiêu đề..."
          />
        </label>
        <figure className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1100&q=85"
            alt="Bàn viết với sổ tay và những trang ghi chép"
          />
          <figcaption><span>01 / GÓC ĐỌC</span> Những điều bắt đầu từ một trang giấy trắng</figcaption>
        </figure>
      </section>
      <section className="content">
        <div className="section-title">
          <h2>Bài viết mới nhất</h2>
          <small>{loading ? "" : `${visible.length} bài viết`}</small>
        </div>
        {loading && <div className="state">Đang tải bài viết...</div>}
        {error && <div className="state error">{error}</div>}
        {!loading && !error && (
          <div className="grid">
            {visible.map((post) => (
              <article
                className="card"
                key={post.id}
                role="link"
                tabIndex={0}
                onClick={() => nav(`/posts/${post.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") nav(`/posts/${post.id}`);
                }}
              >
                <div className="tag">
                  {post.local ? "BÀI VIẾT MỚI" : "MINIBLOG"}
                </div>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <Link to={`/posts/${post.id}`}>
                  Đọc tiếp <span>→</span>
                </Link>
              </article>
            ))}
          </div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="state">Không tìm thấy bài viết phù hợp.</div>
        )}
      </section>
    </main>
  );
}

function Detail() {
  const { id = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const saved = localPosts().find((p) => String(p.id) === id);
    if (saved) {
      setPost(saved);
      setLoading(false);
      return;
    }
    Promise.all([getPost(id), getComments(id)])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading)
    return (
      <main className="detail">
        <div className="state">Đang tải bài viết...</div>
      </main>
    );
  if (error || !post)
    return (
      <main className="detail">
        <div className="state error">{error || "Không tìm thấy bài viết."}</div>
      </main>
    );
  return (
    <main className="detail">
      <Link className="back" to="/">
        ← Quay lại trang chủ
      </Link>
      <article className="post">
        <div className="tag">{post.local ? "BÀI VIẾT MỚI" : "MINIBLOG"}</div>
        <h1>{post.title}</h1>
        <p>{post.body}</p>
      </article>
      <section className="comments">
        <h2>
          Bình luận <span>({comments.length})</span>
        </h2>
        {comments.length ? (
          comments.map((c) => (
            <div className="comment" key={c.id}>
              <div className="avatar">{c.name[0].toUpperCase()}</div>
              <div>
                <strong>{c.name}</strong>
                <small>{c.email}</small>
                <p>{c.body}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="empty">Bài viết này chưa có bình luận.</p>
        )}
      </section>
    </main>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "123456") {
      onLogin();
      nav("/");
    } else setError("Tên đăng nhập hoặc mật khẩu không đúng.");
  };
  return (
    <main className="auth">
      <form onSubmit={submit}>
        <p className="eyebrow">CHÀO MỪNG TRỞ LẠI</p>
        <h1>Đăng nhập</h1>
        <p className="muted">
          Đăng nhập để bắt đầu chia sẻ câu chuyện của bạn.
        </p>
        <label>
          Tên đăng nhập
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoFocus
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123456"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary">Đăng nhập</button>
        <p className="hint">
          Tài khoản mẫu: <b>admin</b> / <b>123456</b>
        </p>
      </form>
    </main>
  );
}

function Write() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      title: title.trim() ? undefined : "Vui lòng nhập tiêu đề.",
      body: body.trim() ? undefined : "Vui lòng nhập nội dung.",
    };
    setErrors(next);
    if (next.title || next.body) return;
    const post: Post = {
      id: Date.now(),
      userId: 1,
      title: title.trim(),
      body: body.trim(),
      local: true,
    };
    localStorage.setItem(
      STORAGE_POSTS,
      JSON.stringify([post, ...localPosts()]),
    );
    nav(`/posts/${post.id}`);
  };
  return (
    <main className="write">
      <Link className="back" to="/">
        ← Quay lại trang chủ
      </Link>
      <h1>Viết bài mới</h1>
      <p>Chia sẻ một ý tưởng, câu chuyện hoặc điều bạn đang quan tâm.</p>
      <form onSubmit={submit}>
        <label>
          Tiêu đề bài viết
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập một tiêu đề thật thu hút..."
          />
          {errors.title && <em>{errors.title}</em>}
        </label>
        <label>
          Nội dung
          <textarea
            rows={9}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Bắt đầu viết câu chuyện của bạn..."
          />
          {errors.body && <em>{errors.body}</em>}
        </label>
        <button className="primary">Đăng bài →</button>
      </form>
    </main>
  );
}

function NotFound() {
  return (
    <main className="notfound">
      <p>404</p>
      <h1>Không tìm thấy trang</h1>
      <Link className="primary" to="/">
        Về trang chủ
      </Link>
    </main>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem(STORAGE_AUTH) === "true",
  );
  const login = () => {
    localStorage.setItem(STORAGE_AUTH, "true");
    setLoggedIn(true);
  };
  const logout = () => {
    localStorage.removeItem(STORAGE_AUTH);
    setLoggedIn(false);
  };
  return (
    <>
      <Header loggedIn={loggedIn} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:id" element={<Detail />} />
        <Route
          path="/login"
          element={
            loggedIn ? <Navigate to="/" replace /> : <Login onLogin={login} />
          }
        />
        <Route
          path="/write"
          element={loggedIn ? <Write /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer>© 2026 MiniBlog · Nơi những điều nhỏ bé được kể lại.</footer>
    </>
  );
}
