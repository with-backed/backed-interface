import React from 'react';
import { DescriptionList } from 'components/DescriptionList';

export default {
  title: 'components/DescriptionList',
  component: DescriptionList,
};

export const List = () => (
  <>
    <DescriptionList orientation="horizontal">
      <dt>Beast of Bodmin</dt>
      <dd>A large feline inhabiting Bodmin Moor.</dd>

      <dt>Morgawr</dt>
      <dd>A sea serpent.</dd>

      <dt>Owlman</dt>
      <dd>A giant owl-like creature.</dd>
    </DescriptionList>
    <DescriptionList orientation="vertical">
      <dt>Beast of Bodmin</dt>
      <dd>A large feline inhabiting Bodmin Moor.</dd>

      <dt>Morgawr</dt>
      <dd>A sea serpent.</dd>

      <dt>Owlman</dt>
      <dd>A giant owl-like creature.</dd>

      <dt>first term</dt>
      <dt>second term</dt>
      <dd>Both of those terms are defined here</dd>
    </DescriptionList>
  </>
);

export const ClampedVersusFluid = () => (
  <>
    <DescriptionList orientation="horizontal">
      <dt>Total accrued interest</dt>
      <dd>12.5 DAI</dd>
      <dt>A particularly long label for this one</dt>
      <dd>yep</dd>
      <dt>normal</dt>
      <dd>Hello!</dd>
    </DescriptionList>
    <br />
    <DescriptionList orientation="horizontal" clamped>
      <dt>Total accrued interest</dt>
      <dd>12.5 DAI</dd>
      <dt>A particularly long label for this one</dt>
      <dd>yep</dd>
      <dt>normal</dt>
      <dd>Hello!</dd>
    </DescriptionList>
  </>
);
