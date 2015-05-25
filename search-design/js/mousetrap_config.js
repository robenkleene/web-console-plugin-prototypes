Mousetrap.bind('down', function() {
	Bullets.selectNext();
  return false;
});

Mousetrap.bind('up', function() {
	Bullets.selectPrevious();
  return false;
});

Mousetrap.bind('return', function() {
	Bullets.followSelection();
  return false;
});

Mousetrap.bind('tab', function() {
	Bullets.toggleCollapseSelection();
  return false;
});

Mousetrap.bind('left', function() {
	Bullets.collapseSelection();
  return false;
});

Mousetrap.bind('right', function() {
	Bullets.expandSelection();
  return false;
});
