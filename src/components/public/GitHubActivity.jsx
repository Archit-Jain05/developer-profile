import { useEffect, useState } from "react";
import { FiArrowUpRight, FiGithub, FiGitCommit } from "react-icons/fi";
import { fetchContributions, fetchGithubActivity, githubUsername, languageColor, toCalendar } from "../../lib/github.js";
import { timeAgo } from "../../lib/format.js";
import { useInView } from "../../hooks/useInView.js";
import "./Sections.css";

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

/** The contribution calendar: one column per week, one square per day. */
function Contributions({ calendar, githubUrl }) {
  const { weeks, months } = toCalendar(calendar.days);
  if (weeks.length === 0) return null;

  return (
    <figure className="contrib">
      <figcaption className="contrib__head">
        <span>{calendar.total.toLocaleString()} contributions in the last year</span>
        <a className="link-out" href={githubUrl} target="_blank" rel="noopener noreferrer">
          See the profile <FiArrowUpRight aria-hidden="true" />
        </a>
      </figcaption>

      <div className="contrib__scroll">
        <div className="contrib__plot">
          <div className="contrib__months" aria-hidden="true">
            {months.map((m) => (
              <span key={`${m.label}-${m.index}`} style={{ gridColumn: m.index + 1 }}>
                {m.label}
              </span>
            ))}
          </div>

          <ul className="contrib__days" aria-hidden="true">
            {DAY_LABELS.map((label, i) => (
              <li key={i}>{label}</li>
            ))}
          </ul>

          <div className="contrib__weeks">
            {weeks.map((week, w) => (
              <div className="contrib__week" key={w}>
                {week.map((day, d) =>
                  day ? (
                    <span
                      key={day.date}
                      className="contrib__day"
                      data-level={day.level}
                      title={`${day.count} on ${day.date}`}
                    />
                  ) : (
                    <span key={`${w}-${d}`} className="contrib__day is-empty" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="contrib__legend" aria-hidden="true">
        Less
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className="contrib__day" data-level={level} />
        ))}
        More
      </p>
    </figure>
  );
}

export default function GitHubActivity({ githubUrl }) {
  const username = githubUsername(githubUrl);
  const [ref, inView] = useInView({ rootMargin: "300px" });
  const [state, setState] = useState({ status: "idle", data: null });
  const [calendar, setCalendar] = useState(null);

  // Only call GitHub once the section is close to the viewport.
  useEffect(() => {
    if (!username || !inView) return;
    const controller = new AbortController();
    setState({ status: "loading", data: null });
    fetchGithubActivity(username, { signal: controller.signal })
      .then((data) => setState({ status: "ready", data }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.warn("[github] Could not load activity:", error.message);
        setState({ status: "error", data: null });
      });
    fetchContributions(username, { signal: controller.signal })
      .then(setCalendar)
      .catch((error) => {
        if (error.name !== "AbortError") console.warn("[github] Could not load contributions:", error.message);
      });
    return () => controller.abort();
  }, [username, inView]);

  if (!username) return null;
  const { status, data } = state;

  return (
    <section id="github" className="section" ref={ref}>
      <div className="container">
        <div className="github glass">
          <div className="github__head">
            <div className="section-head">
              <h2 className="section-title">Live from GitHub</h2>
              <p className="section-lede">What I've been pushing lately, pulled straight from my public repos.</p>
            </div>
            <a className="btn btn--ghost btn--sm" href={githubUrl} target="_blank" rel="noopener noreferrer">
              <FiGithub aria-hidden="true" /> @{username}
            </a>
          </div>

          {(status === "idle" || status === "loading") && (
            <div className="github__grid" aria-busy="true">
              <div className="skeleton" style={{ height: 180 }} />
              <div className="skeleton" style={{ height: 180 }} />
            </div>
          )}

          {status === "error" && (
            <p className="github__error">
              GitHub isn't responding right now.{" "}
              <a className="link-out" href={githubUrl} target="_blank" rel="noopener noreferrer">
                See my profile on GitHub <FiArrowUpRight aria-hidden="true" />
              </a>
            </p>
          )}

          {status === "ready" && data && (
            <div className="github__grid">
              <div className="github__stats">
                <dl className="github__numbers">
                  <div>
                    <dt>Public repos</dt>
                    <dd>{data.publicRepos}</dd>
                  </div>
                  <div>
                    <dt>Stars earned</dt>
                    <dd>{data.stars}</dd>
                  </div>
                  <div>
                    <dt>Followers</dt>
                    <dd>{data.followers}</dd>
                  </div>
                </dl>

                {data.languages.length > 0 && (
                  <div className="langs">
                    <p className="langs__title">Languages by code size</p>
                    <div className="langs__bar" role="img" aria-label={data.languages.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(", ")}>
                      {data.languages.map((l) => (
                        <span key={l.name} style={{ flexGrow: l.share, background: languageColor(l.name) }} />
                      ))}
                    </div>
                    <ul className="langs__legend">
                      {data.languages.map((l) => (
                        <li key={l.name}>
                          <i style={{ background: languageColor(l.name) }} />
                          {l.name} <span>{Math.round(l.share * 100)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <ul className="repo-feed" aria-label="Recently updated repositories">
                {data.recent.map((repo) => (
                  <li key={repo.name}>
                    <a className="repo" href={repo.url} target="_blank" rel="noopener noreferrer">
                      <FiGitCommit className="repo__icon" aria-hidden="true" />
                      <span className="repo__main">
                        <strong>{repo.name}</strong>
                        <span className="repo__meta">
                          {repo.language && (
                            <span className="repo__lang">
                              <i style={{ background: languageColor(repo.language) }} />
                              {repo.language}
                            </span>
                          )}
                          <time dateTime={repo.pushedAt}>Pushed {timeAgo(repo.pushedAt)}</time>
                        </span>
                      </span>
                      <FiArrowUpRight className="repo__arrow" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {calendar && <Contributions calendar={calendar} githubUrl={githubUrl} />}
        </div>
      </div>
    </section>
  );
}
