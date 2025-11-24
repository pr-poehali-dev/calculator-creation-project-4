import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HistoryItem {
  expression: string;
  result: string;
}

interface Settings {
  theme: 'light' | 'dark' | 'gradient';
  soundEnabled: boolean;
  precision: number;
}

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: 'gradient',
    soundEnabled: true,
    precision: 2
  });

  const playSound = () => {
    if (settings.soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const handleNumber = (num: string) => {
    playSound();
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperation = (op: string) => {
    playSound();
    if (previousValue !== null && operation !== null) {
      calculate();
    }
    setPreviousValue(display);
    setOperation(op);
    setDisplay('0');
  };

  const calculate = () => {
    playSound();
    if (previousValue === null || operation === null) return;
    
    const prev = parseFloat(previousValue);
    const current = parseFloat(display);
    let result: number;
    
    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        if (current === 0) {
          setDisplay('Error');
          setPreviousValue(null);
          setOperation(null);
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }
    
    const roundedResult = parseFloat(result.toFixed(settings.precision));
    const resultString = roundedResult.toString();
    
    setHistory([
      { expression: `${previousValue} ${operation} ${display}`, result: resultString },
      ...history.slice(0, 9)
    ]);
    
    setDisplay(resultString);
    setPreviousValue(null);
    setOperation(null);
  };

  const clear = () => {
    playSound();
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const handleDecimal = () => {
    playSound();
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handlePercentage = () => {
    playSound();
    const value = parseFloat(display) / 100;
    setDisplay(value.toString());
  };

  const toggleSign = () => {
    playSound();
    if (display !== '0' && display !== 'Error') {
      setDisplay((parseFloat(display) * -1).toString());
    }
  };

  const useHistoryItem = (item: HistoryItem) => {
    setDisplay(item.result);
  };

  const buttons = [
    { label: 'AC', action: clear, class: 'operation' },
    { label: '±', action: toggleSign, class: 'operation' },
    { label: '%', action: handlePercentage, class: 'operation' },
    { label: '÷', action: () => handleOperation('÷'), class: 'operator' },
    { label: '7', action: () => handleNumber('7'), class: 'number' },
    { label: '8', action: () => handleNumber('8'), class: 'number' },
    { label: '9', action: () => handleNumber('9'), class: 'number' },
    { label: '×', action: () => handleOperation('×'), class: 'operator' },
    { label: '4', action: () => handleNumber('4'), class: 'number' },
    { label: '5', action: () => handleNumber('5'), class: 'number' },
    { label: '6', action: () => handleNumber('6'), class: 'number' },
    { label: '-', action: () => handleOperation('-'), class: 'operator' },
    { label: '1', action: () => handleNumber('1'), class: 'number' },
    { label: '2', action: () => handleNumber('2'), class: 'number' },
    { label: '3', action: () => handleNumber('3'), class: 'number' },
    { label: '+', action: () => handleOperation('+'), class: 'operator' },
    { label: '0', action: () => handleNumber('0'), class: 'number zero' },
    { label: '.', action: handleDecimal, class: 'number' },
    { label: '=', action: calculate, class: 'equals' }
  ];

  const getThemeClass = () => {
    switch (settings.theme) {
      case 'dark':
        return 'bg-gradient-to-br from-slate-900 to-slate-800';
      case 'gradient':
        return 'bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600';
      default:
        return 'bg-gradient-to-br from-blue-50 to-purple-50';
    }
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 bg-cover bg-center bg-no-repeat`}
      style={{
        backgroundImage: 'url(https://cdn.poehali.dev/files/0a0920fd-c19e-4752-bbc4-29c0036a57bf.jpg)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-3xl font-bold ${settings.theme === 'dark' ? 'text-white' : 'text-white'} drop-shadow-lg`}>
            Калькулятор
          </h1>
          
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`${settings.theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/20'} backdrop-blur-sm rounded-full`}
                >
                  <Icon name="History" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>История вычислений</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">История пуста</p>
                  ) : (
                    history.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => useHistoryItem(item)}
                        className="w-full p-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors text-left"
                      >
                        <div className="text-sm text-muted-foreground">{item.expression}</div>
                        <div className="text-lg font-bold">{item.result}</div>
                      </button>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`${settings.theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/20'} backdrop-blur-sm rounded-full`}
                >
                  <Icon name="Settings" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Настройки</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label>Тема</Label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value: any) => setSettings({...settings, theme: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Светлая</SelectItem>
                        <SelectItem value="dark">Тёмная</SelectItem>
                        <SelectItem value="gradient">Градиент</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound">Звуковые эффекты</Label>
                    <Switch
                      id="sound"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => setSettings({...settings, soundEnabled: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Точность (знаков после запятой)</Label>
                    <Select 
                      value={settings.precision.toString()} 
                      onValueChange={(value) => setSettings({...settings, precision: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Card className="p-6 backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-6 min-h-[120px] flex flex-col justify-end">
            {operation && previousValue && (
              <div className="text-white/60 text-right text-lg mb-2 font-light">
                {previousValue} {operation}
              </div>
            )}
            <div className="text-white text-right text-5xl font-bold break-all font-['Montserrat']">
              {display}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {buttons.map((btn, index) => (
              <Button
                key={index}
                onClick={btn.action}
                className={`
                  h-16 text-xl font-semibold rounded-2xl transition-all duration-200
                  transform hover:scale-105 active:scale-95
                  ${btn.class === 'number' ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-white/30' : ''}
                  ${btn.class === 'operation' ? 'bg-white/30 hover:bg-white/40 text-white backdrop-blur-md' : ''}
                  ${btn.class === 'operator' ? 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg' : ''}
                  ${btn.class === 'equals' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg' : ''}
                  ${btn.label === '0' ? 'col-span-2' : ''}
                  shadow-xl
                `}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </Card>

        <div className={`text-center ${settings.theme === 'dark' ? 'text-white/70' : 'text-white/90'} text-sm`}>
          Создано с ❤️ на poehali.dev
        </div>
      </div>
    </div>
  );
}