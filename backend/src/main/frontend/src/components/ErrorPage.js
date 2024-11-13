import React from 'react';

function ErrorPage() {
  return React.createElement(
    'div',
    { className: 'min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4' },
    React.createElement(
      'h1',
      { className: 'text-4xl md:text-6xl font-bold text-center mb-8 leading-tight' },
      '권한이 없거나',
      React.createElement('br'),
      '없는 페이지입니다'
    ),
    React.createElement('div', { className: 'w-24 h-1 bg-red-500 mb-8' }),
    React.createElement(
      'div',
      { className: 'text-center max-w-2xl mb-8' },
      React.createElement(
        'p',
        { className: 'text-lg md:text-xl mb-4' },
        '요청하신 페이지에 접근할 수 없습니다.'
      ),
      React.createElement(
        'p',
        { className: 'text-base md:text-lg text-gray-400' },
        '페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.',
        React.createElement('br'),
        '또는 현재 페이지에 대한 접근 권한이 없을 수 있습니다.'
      )
    ),
    React.createElement(
      'a',
      {
        href: '/main',
        className: 'mt-4 inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105'
      },
      '메인 페이지로 이동'
    )
  );
}

export default ErrorPage;
