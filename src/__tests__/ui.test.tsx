import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { ProgressProvider, STORAGE_KEY } from '../lib/progress';

function renderAt(path: string) {
  return render(
    <ProgressProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </ProgressProvider>,
  );
}

beforeEach(() => window.localStorage.clear());

const routes: [string, RegExp][] = [
  ['/', /Your M3 preparation/],
  ['/vector-calculus', /Unit I: Vector Calculus/],
  ['/laplace-transforms', /Unit II: Laplace Transforms/],
  ['/fourier-methods', /Unit III: Fourier Methods/],
  ['/first-order-pdes', /Unit IV: First-Order PDEs/],
  ['/higher-order-pdes', /Unit V: Higher-Order PDEs/],
  ['/papers', /Previous Papers, Practice and Mock Exams/],
];

describe('seven routes', () => {
  it.each(routes)('renders %s', async (path, heading) => {
    renderAt(path);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('shows a not-found state for unknown paths', async () => {
    renderAt('/nope');
    expect(await screen.findByText(/exactly seven pages/)).toBeInTheDocument();
  });
});

describe('unit page interactions', () => {
  it('opens the requested topic and marks it Learning in saved progress', async () => {
    renderAt('/first-order-pdes?topic=u4-clairaut');
    expect(await screen.findByRole('heading', { level: 2, name: /Clairaut's equation/ })).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.topicStatus['u4-clairaut']).toBe('learning');
  });

  it('scores a topic quiz and saves the result', async () => {
    renderAt('/first-order-pdes?topic=u4-clairaut');
    const quiz = await screen.findByRole('heading', { name: /7 · Topic quiz/ });
    const card = quiz.closest('section')!;
    const radios = within(card).getAllByRole('radio');
    fireEvent.click(radios[0]); // correct option for q-u4cl-1
    fireEvent.click(within(card).getByRole('button', { name: 'Submit quiz' }));
    expect(within(card).getByRole('status')).toHaveTextContent('Score: 1/1');
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.quiz['u4-clairaut']).toMatchObject({ best: 1, total: 1 });
  });

  it('asks before revealing a solution with no attempt, then records a self-mark', async () => {
    renderAt('/first-order-pdes?topic=u4-clairaut');
    const practice = (await screen.findByRole('heading', { name: /5 · Practise independently/ })).closest('section')!;
    const firstCard = within(practice).getAllByRole('article')[0];
    fireEvent.click(within(firstCard).getByRole('button', { name: 'Reveal full solution' }));
    expect(within(firstCard).getByRole('alertdialog')).toBeInTheDocument();
    expect(within(firstCard).queryByText(/Step-by-step solution/)).toBeNull();
    fireEvent.click(within(firstCard).getByRole('button', { name: 'Yes, reveal' }));
    expect(within(firstCard).getByText(/Step-by-step solution/)).toBeInTheDocument();
    fireEvent.click(within(firstCard).getByRole('button', { name: /Incorrect/ }));
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    const ids = Object.keys(saved.mistakes);
    expect(ids).toHaveLength(1);
    expect(saved.attempts[ids[0]].result).toBe('incorrect');
  });
});

describe('dashboard', () => {
  it('does not invent an exam date and computes the countdown from input', async () => {
    renderAt('/');
    expect(await screen.findByText('No exam date set yet.')).toBeInTheDocument();
    const d = new Date();
    d.setDate(d.getDate() + 12);
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    fireEvent.change(screen.getByLabelText('Exam date'), { target: { value: v } });
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('requires confirmation before resetting', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, examDate: '2099-01-01', topicStatus: { 'u1-grad': 'mastered' } }));
    renderAt('/');
    fireEvent.click(await screen.findByRole('button', { name: 'Reset all progress' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).examDate).toBe('2099-01-01');
    fireEvent.click(screen.getByRole('button', { name: 'Reset all progress' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, reset' }));
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).examDate).toBeNull();
  });

  it('opens the formula review dialog', async () => {
    renderAt('/');
    fireEvent.click(await screen.findByRole('button', { name: 'Formula review' }));
    const dlg = await screen.findByRole('dialog');
    expect(within(dlg).getByRole('heading', { name: 'Formula review' })).toBeInTheDocument();
    fireEvent.click(within(dlg).getByRole('tab', { name: 'Unit III' }));
    expect(within(dlg).getByText("Euler's formulae on (c, c+2π)")).toBeInTheDocument();
    expect(within(dlg).queryByText('Gradient')).toBeNull();
    fireEvent.click(within(dlg).getByRole('button', { name: 'Close formula review' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('page 7', () => {
  it('filters the question bank by source', async () => {
    renderAt('/papers?tab=bank');
    const status = await screen.findByText(/questions?$/, { selector: '[role=status]' });
    const total = parseInt(status.textContent!, 10);
    fireEvent.change(screen.getByLabelText('Source'), { target: { value: 'uploaded_past_paper' } });
    expect(screen.getByRole('status')).toHaveTextContent('97 questions');
    expect(total).toBeGreaterThan(97);
  });

  it('runs a mock exam: start, choose, submit, mark, save', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderAt('/papers?tab=mock');
    fireEvent.change(await screen.findByLabelText('Type'), { target: { value: 'paper' } });
    fireEvent.click(screen.getByRole('button', { name: 'Start mock exam' }));
    expect(await screen.findByRole('timer')).toHaveTextContent('180:00');
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]); // unit I, option Q1
    fireEvent.click(screen.getAllByRole('button', { name: /^Submit/ })[0]);
    const inputs = await screen.findAllByLabelText(/Marks awarded/);
    expect(inputs).toHaveLength(2); // Jan 2023 Set 1 Q1(a), Q1(b)
    inputs.forEach((i) => fireEvent.change(i, { target: { value: '7' } }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save result' })); });
    expect(await screen.findByText(/Result saved: 14\/14/)).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.mocks).toHaveLength(1);
    expect(saved.mocks[0]).toMatchObject({ score: 14, max: 14 });
    vi.useRealTimers();
  });

  it('shows the research archive honestly', async () => {
    renderAt('/papers');
    expect(await screen.findByText(/none could be opened from this build environment/i)).toBeInTheDocument();
    expect(screen.getAllByText('Unverified').length).toBeGreaterThan(0);
  });
});
