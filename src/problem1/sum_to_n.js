
var sum_to_n_a = function (n) {
  let sum = 0;
  if (n >= 0) {
    for (let i = 1; i <= n; i++) sum += i;
  } else {
    for (let i = -1; i >= n; i--) sum += i;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  const sign = Math.sign(n);
  const m = Math.abs(n);
  return (sign * m * (m + 1)) / 2;
};

var sum_to_n_c = function (n) {
  const sign = Math.sign(n);
  const m = Math.abs(n);
  return Array.from({ length: m }, (_, i) => (i + 1) * sign).reduce(
    (acc, value) => acc + value,
    0
  );
};

