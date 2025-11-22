'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Operator = '+' | '-' | '?' | '?' | null;

export default function CalculatorPage() {
  const [display, setDisplay] = useState<string>('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);
  const [justEvaluated, setJustEvaluated] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const calculate = (a: number, b: number, op: Operator): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '?':
        return a * b;
      case '?':
        if (b === 0) return NaN;
        return a / b;
      default:
        return b;
    }
  };

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand || display === 'Error' || justEvaluated) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
      setJustEvaluated(false);
    } else {
      setDisplay(prev => (prev === '0' ? digit : prev + digit));
    }
  };

  const inputDot = () => {
    if (waitingForSecondOperand || justEvaluated) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      setJustEvaluated(false);
      return;
    }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const clearAll = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setJustEvaluated(false);
  };

  const toggleSign = () => {
    if (display === '0' || display === 'Error') return;
    if (display.startsWith('-')) setDisplay(display.slice(1));
    else setDisplay('-' + display);
  };

  const percent = () => {
    const value = parseFloat(display);
    if (Number.isNaN(value)) return;
    setDisplay(String(value / 100));
  };

  const performOperator = (nextOperator: Operator) => {
    const inputValue = parseFloat(display);
    if (Number.isNaN(inputValue)) return;

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(Number.isFinite(result) ? String(result) : 'Error');
      setFirstOperand(Number.isFinite(result) ? result : null);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
    setJustEvaluated(false);
  };

  const equals = () => {
    const inputValue = parseFloat(display);
    if (Number.isNaN(inputValue)) return;

    if (firstOperand !== null && operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(Number.isFinite(result) ? String(result) : 'Error');
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecondOperand(false);
      setJustEvaluated(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        inputDigit(key);
        return;
      }
      if (key === '.') {
        e.preventDefault();
        inputDot();
        return;
      }
      if (key === '+' || key === '-') {
        e.preventDefault();
        performOperator(key as Operator);
        return;
      }
      if (key === '*' || key === 'x') {
        e.preventDefault();
        performOperator('?');
        return;
      }
      if (key === '/' || key === '?') {
        e.preventDefault();
        performOperator('?');
        return;
      }
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        equals();
        return;
      }
      if (key === 'Escape') {
        e.preventDefault();
        clearAll();
        return;
      }
      if (key === '%') {
        e.preventDefault();
        percent();
        return;
      }
      if (key === 'F9') {
        e.preventDefault();
        toggleSign();
        return;
      }
      if (key === 'Backspace') {
        e.preventDefault();
        if (justEvaluated) {
          clearAll();
        } else {
          setDisplay(prev => (prev.length <= 1 || prev === '-0' ? '0' : prev.slice(0, -1)));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, firstOperand, operator, waitingForSecondOperand, justEvaluated]);

  const Button = useMemo(
    () =>
      function Button({ label, onClick, variant = 'default', span = 1, ariaLabel }: {
        label: string;
        onClick: () => void;
        variant?: 'default' | 'op' | 'util' | 'equals';
        span?: number;
        ariaLabel?: string;
      }) {
        return (
          <button
            type="button"
            className={`btn ${variant} ${span === 2 ? 'span-2' : ''}`}
            onClick={onClick}
            aria-label={ariaLabel || label}
          >
            {label}
          </button>
        );
      },
    []
  );

  return (
    <div ref={containerRef} className="page">
      <main className="calculator" role="application" aria-label="??? ?????">
        <div className="display" aria-live="polite" aria-atomic="true">
          {Intl.NumberFormat('ar-EG').format(Number(display))}
        </div>
        <div className="grid">
          <Button label="???" variant="util" onClick={clearAll} ariaLabel="??? ????" />
          <Button label="?" variant="util" onClick={toggleSign} ariaLabel="????? ???????" />
          <Button label="?" variant="util" onClick={percent} ariaLabel="???? ?????" />
          <Button label="?" variant="op" onClick={() => performOperator('?')} ariaLabel="????" />

          <Button label="7" onClick={() => inputDigit('7')} />
          <Button label="8" onClick={() => inputDigit('8')} />
          <Button label="9" onClick={() => inputDigit('9')} />
          <Button label="?" variant="op" onClick={() => performOperator('?')} ariaLabel="???" />

          <Button label="4" onClick={() => inputDigit('4')} />
          <Button label="5" onClick={() => inputDigit('5')} />
          <Button label="6" onClick={() => inputDigit('6')} />
          <Button label="?" variant="op" onClick={() => performOperator('-')} ariaLabel="???" />

          <Button label="1" onClick={() => inputDigit('1')} />
          <Button label="2" onClick={() => inputDigit('2')} />
          <Button label="3" onClick={() => inputDigit('3')} />
          <Button label="+" variant="op" onClick={() => performOperator('+')} ariaLabel="???" />

          <Button label="0" span={2} onClick={() => inputDigit('0')} />
          <Button label="," onClick={inputDot} ariaLabel="????? ?????" />
          <Button label="=" variant="equals" onClick={equals} ariaLabel="?????" />
        </div>
      </main>
    </div>
  );
}
