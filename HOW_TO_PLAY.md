<!--
  タイムスターの「遊び方・ルール」テキスト。
  「あそびかた」画面とプレイ中のルールの両方に表示されます。

  編集のあと: npm run dev または npm run build（保存で dev 反映）。

  書き方:
  - 段落・見出しは Markdown（## 見出し、**太字**、[表示名](URL)、- リスト）
  - レイアウト用のブロックは HTML（既存と同じ Tailwind の class 名）も可
-->

<img src="howto-header.png" alt="TIMESTER タイムスター 現代アイテム" class="mb-6 w-full" />

## あそびかた

このゲームは「タイムスター」といいます。  
身近な商品が**日本で発売された年**をあてて、年の順番に並べていくゲームです。

> 着想のもとになったボードゲーム HITSTER（音楽のヒット年を並べるゲーム）も、ぜひ [公式情報](https://hitstergame.com/ja-jp/) からご覧ください。

<div class="mt-4 rounded-2xl border-2 border-theme-blue/35 bg-[#EAF4FF] p-4 text-sm text-gray-700 leading-relaxed">
  <p class="font-black text-theme-blue mb-2">人数・時間・対象年齢の目安</p>
  <ul class="list-disc pl-5 space-y-1.5 marker:text-theme-blue/70">
    <li>推奨人数は<strong>2名～5名</strong>です（一応、<strong>1人</strong>でも遊べます）。</li>
    <li><strong>6名以上</strong>になる場合は<strong>チーム戦</strong>もおすすめです。</li>
    <li><strong>2人</strong>でプレイする場合の目安は、<strong>1プレイ5～10分程度</strong>です。</li>
  </ul>
  <p class="mt-3 pt-3 border-t border-theme-blue/25 leading-relaxed">
    <strong>対象年齢の目安：</strong>
    <strong>8歳以上</strong>。
    商品名と西暦年を紙に自分で書くため、<strong>ひらがな・数字の読み書き</strong>ができることが望ましいです。
    おうちの人と子どもが<strong>同じチーム</strong>になって相談しながら遊ぶのもおすすめです。
  </p>
</div>

<div class="bg-theme-bg p-6 rounded-3xl border-2 border-dashed border-gray-300 mt-4">
  <h3 class="text-xl font-black mb-3">準備物</h3>
  <ul class="text-sm leading-relaxed text-gray-600 list-disc pl-5 space-y-1.5 marker:text-gray-500">
    <li>スマホ1台（タブレットやPCでも可）。テーブルの真ん中に置き、みんなで画面を見ます</li>
    <li>机</li>
    <li>折り紙を1/4に切ったもの（人数×5枚）</li>
    <li>鉛筆を参加人数分</li>
  </ul>
</div>

<h3 class="text-2xl font-black font-display uppercase tracking-tight mt-8 mb-0 text-gray-900">ゲームの進め方</h3>

<div class="space-y-4 text-gray-700 bg-white p-6 rounded-3xl border-4 border-theme-bg shadow-inner">
  <div class="flex gap-4">
    <div class="bg-theme-yellow text-gray-800 font-bold w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm tabular-nums mt-0.5">1</div>
    <p class="text-sm min-w-0">
      <strong>起点を決める：</strong>まず順番を決めます。じゃんけんをして、勝った人から時計回りに行います。<br />
      次に、「ゲームを始める」を押すと、最初の1枚は<strong>起点カード</strong>として、商品名と発売年が画面に表示されます。
      各プレイヤーは、<strong>発売年と商品名</strong>を<strong>1枚目の紙</strong>に書き、自分の前のテーブルに置いてください。
      全員が起点の紙を用意できたら、「つぎへ進む」を押して<strong>ゲーム開始</strong>です。
    </p>
  </div>
  <div class="flex gap-4">
    <div class="bg-theme-coral text-white font-bold w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm tabular-nums mt-0.5">2</div>
    <div class="text-sm min-w-0 space-y-2">
      <p>
        <strong>順番が来た人</strong>は、画面に出た<strong>商品名</strong>を見て、その商品が<strong>自分の前に並んでいる紙</strong>のどこに入るかを予想します。
        <strong>左が「前（古い）」、右が「後（新しい）」</strong>です。用意してある紙を1枚とり、予想した位置に置きます。
      </p>
      <p class="text-gray-500">注意：商品名を見ても、それが何なのか分からないときは、<strong>「パス」</strong>で次のカードに進めます。</p>
    </div>
  </div>
  <div class="flex gap-4">
    <div class="bg-theme-blue text-white font-bold w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm tabular-nums mt-0.5">3</div>
    <p class="text-sm min-w-0">
      <strong>「答えをみる」</strong>を押して確認します。当たっていたら、その紙に商品名と発売年を書きます。はずれたら、紙は何も書かずに手元に戻します。
      <strong>「つぎへ進む」</strong>を押して、<strong>次の人の番</strong>です。
    </p>
  </div>
  <p class="text-sm text-gray-700 pl-11">
    番が回ってきたとき、手元に商品名・年が書いてある紙が複数ある場合は、<strong>紙と紙の間</strong>にも、予想の紙を置いていきます。（タイムライン順に並べます）
    ゲーム後半になるにつれ、置ける場所が増えるので、正解の位置を見つけることが難しくなっていきます。
  </p>
  <p class="text-sm text-gray-700 border-t border-gray-100 pt-3 mt-1 pl-11">
    紙を<strong>5枚</strong>（起点の紙もふくめて）、正しい順に並べられた人から<strong>「あがり」</strong>で抜けていきます。最初に抜けた人が1位、その次が2位、と続きます。<strong>残り1人</strong>になったらゲーム終了です。
  </p>
</div>

<div class="bg-theme-trivia p-6 rounded-3xl border-2 border-theme-yellow text-xs not-italic text-gray-600 mt-4 leading-relaxed space-y-2">
  <p>※発売年がすでにある紙と<strong>同じ年</strong>だった場合、<strong>紙が隣り合っていれば正解</strong>です。</p>
  <p>※慣れてきたら、あがりに必要な紙の枚数を増やしてください。増やせば増やすほど、難易度が上がります。</p>
  <p>※答えは<strong>日本で最初に発売（登場）された年</strong>です。</p>
</div>
